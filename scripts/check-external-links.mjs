// Checks every external link in a built site. Usage: node scripts/check-external-links.mjs [distDir]
// Only GET requests are made (no forms, no sign-in), so linked apps are never modified.
// Exit code 1 only for links that are definitely broken (404/410/5xx, unknown host);
// bot walls and network failures are reported separately because they say nothing about the link.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 4;
const BOT_WALL_HOSTS = /(^|\.)(linkedin\.com|instagram\.com|facebook\.com|x\.com|twitter\.com)$/;

if (!fs.existsSync(dist)) {
  console.error(`No build at ${dist}. Run \`npm run build\` first.`);
  process.exit(2);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

const siteOrigin = (() => {
  const robots = path.join(dist, 'robots.txt');
  const match = fs.existsSync(robots) && fs.readFileSync(robots, 'utf8').match(/Sitemap:\s*(https?:\/\/[^/\s]+)/i);
  return match ? match[1] : null;
})();

const pagesByUrl = new Map();
for (const file of walk(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/<(?:a|iframe|source|video)\b[^>]*\s(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    const clean = url.replaceAll('&amp;', '&');
    if (siteOrigin && clean.startsWith(siteOrigin)) continue; // own canonical/OG URLs, checked by the build tests
    if (!pagesByUrl.has(clean)) pagesByUrl.set(clean, new Set());
    pagesByUrl.get(clean).add(path.relative(dist, file));
  }
}

async function check(url) {
  const host = new URL(url).hostname;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
      },
    });
    res.body?.cancel().catch(() => {});
    const s = res.status;
    if (s < 400) return { kind: 'ok', detail: `${s}${res.redirected ? ` → ${res.url}` : ''}` };
    if (s === 999 || ((s === 401 || s === 403 || s === 429) && BOT_WALL_HOSTS.test(host))) return { kind: 'blocked', detail: `${s} (bot protection; open it in a browser)` };
    if (s === 404 || s === 410 || s >= 500) return { kind: 'broken', detail: String(s) };
    return { kind: 'blocked', detail: `${s} (refused automated request)` };
  } catch (error) {
    const code = error?.cause?.code ?? error?.name ?? 'error';
    if (code === 'ENOTFOUND') return { kind: 'broken', detail: 'host not found (DNS)' };
    return { kind: 'network', detail: `${code}: no answer from here (offline, firewall, or timeout)` };
  }
}

const urls = [...pagesByUrl.keys()].sort();
const results = new Map();
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await check(url));
    }
  }),
);

const labels = { ok: 'OK', blocked: 'BLOCKED', network: 'NETWORK', broken: 'BROKEN' };
for (const url of urls) {
  const { kind, detail } = results.get(url);
  console.log(`${labels[kind].padEnd(8)} ${url}  ${detail}`);
  if (kind === 'broken') console.log(`         linked from: ${[...pagesByUrl.get(url)].join(', ')}`);
}
const tally = Object.fromEntries(Object.keys(labels).map((k) => [k, [...results.values()].filter((r) => r.kind === k).length]));
console.log(`\n${urls.length} external links: ${tally.ok} ok, ${tally.blocked} blocked by the site, ${tally.network} unreachable from this network, ${tally.broken} broken.`);
process.exit(tally.broken > 0 ? 1 : 0);
