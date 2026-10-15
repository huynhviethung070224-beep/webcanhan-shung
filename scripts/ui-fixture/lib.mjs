/**
 * Isolated fixture builds. Each scenario is built in a throwaway copy of the
 * repo under the system temp folder; the real `src/` and `public/` are never
 * written to, and nothing here is part of the published site.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(here, '../..');
export const FIXTURE_ORIGIN = 'https://fixture.invalid';

const SKIP = new Set(['node_modules', 'dist', '.git', '.astro', '.vercel', '.env.local', 'test-results', 'playwright-report']);

/** Slugs and titles that must never appear in any public output. */
export const PRIVATE_MARKERS = ['fixture-draft', 'fixture-future', 'fixture-draft-project', '_template', 'Draft fixture', 'Future fixture'];

export const fixtureDir = (name) => resolve(tmpdir(), `ian-ui-fixture-${name}`);

/**
 * @param {string} name
 * @param {{
 *   content?: boolean,                 // copy scripts/ui-fixture/content into src/content
 *   assets?: boolean,                  // create fixture images/PDFs in public/
 *   site?: Record<string, unknown>,    // Object.assign onto `site` before validation
 *   certificates?: unknown[],          // replaces `certificates` before validation
 *   skillGroups?: unknown[],           // replaces `skillGroups`
 *   files?: Record<string, string>,    // extra files (repo-relative path → contents)
 *   remove?: string[],                 // repo-relative paths to delete
 * }} scenario
 */
export function prepareFixture(name, scenario = {}) {
  const out = fixtureDir(name);
  rmSync(out, { recursive: true, force: true });
  cpSync(repoRoot, out, {
    recursive: true,
    filter: (src) => src === repoRoot || !SKIP.has(relative(repoRoot, src).split('/')[0]),
  });
  symlinkSync(join(repoRoot, 'node_modules'), join(out, 'node_modules'), 'dir');

  if (scenario.content) cpSync(join(here, 'content'), join(out, 'src/content'), { recursive: true });
  if (scenario.assets) writeFixtureAssets(join(out, 'public'));

  if (scenario.site) {
    inject(out, 'src/config/site.ts', 'validateOptionalPublicAsset(site.resume', `Object.assign(site as any, ${JSON.stringify(scenario.site, null, 2)});`);
  }
  if (scenario.certificates) {
    inject(
      out,
      'src/config/portfolio.ts',
      'for (const [index, certificate] of certificates.entries())',
      `certificates.splice(0, certificates.length, ...(${JSON.stringify(scenario.certificates, null, 2)} as any));`,
    );
  }
  if (scenario.skillGroups) {
    inject(out, 'src/config/portfolio.ts', 'export interface Certificate', `skillGroups.splice(0, skillGroups.length, ...(${JSON.stringify(scenario.skillGroups)} as any));`);
  }
  for (const [path, contents] of Object.entries(scenario.files ?? {})) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), contents);
  }
  for (const path of scenario.remove ?? []) rmSync(join(out, path), { recursive: true, force: true });
  return out;
}

/** Runs `astro build` in a prepared fixture. Never throws; inspect `ok` and `output`. */
export function buildFixture(out, { quiet = false } = {}) {
  const result = spawnSync('npx', ['astro', 'build'], {
    cwd: out,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_SITE_ORIGIN: FIXTURE_ORIGIN, VERCEL_ENV: '', VERCEL_URL: '' },
    stdio: quiet ? 'pipe' : ['ignore', 'inherit', 'inherit'],
  });
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}`, dist: join(out, 'dist') };
}

export function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}

/** Returns a list of problems: private markers in output text or emitted file paths. */
export function auditPrivacy(dist) {
  const problems = [];
  for (const file of walk(dist)) {
    const rel = relative(dist, file);
    for (const marker of PRIVATE_MARKERS) {
      if (rel.includes(marker)) problems.push(`emitted: ${rel}`);
    }
    if (/\.(html|xml|txt|json)$/.test(file)) {
      const text = readFileSync(file, 'utf8');
      for (const marker of PRIVATE_MARKERS) if (text.includes(marker)) problems.push(`${rel} contains "${marker}"`);
    }
  }
  return problems;
}

function inject(out, file, anchor, code) {
  const path = join(out, file);
  const src = readFileSync(path, 'utf8');
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`[fixture] anchor not found in ${file}: ${anchor}`);
  writeFileSync(path, `${src.slice(0, at)}\n// --- FIXTURE OVERRIDE (temp copy only) ---\n${code}\n${src.slice(at)}`);
}

function writeFixtureAssets(pub) {
  for (const [from, to] of [
    ['projects/badminton-fairplay-queue/court-mobile.png', 'about/fixture-portrait.png'],
    ['projects/dragon-go/home.webp', 'certificates/fixture-cert.webp'],
    ['projects/library-management-system/erd.png', 'blog/fixture-long-article/cover.png'],
    ['projects/dragon-go/home.webp', 'projects/fixture-full-case-study/cover.webp'],
    ['projects/dragon-go/map.webp', 'projects/fixture-full-case-study/map.webp'],
    ['projects/dragon-go/tour.webp', 'projects/fixture-full-case-study/tour.webp'],
    ['projects/library-management-system/erd.png', 'projects/fixture-full-case-study/chart.png'],
  ]) {
    mkdirSync(dirname(join(pub, to)), { recursive: true });
    cpSync(join(pub, from), join(pub, to));
  }
  for (const pdf of ['resume/fixture-resume.pdf', 'certificates/fixture-cert.pdf', 'projects/fixture-full-case-study/report.pdf']) {
    mkdirSync(dirname(join(pub, pdf)), { recursive: true });
    writeFileSync(join(pub, pdf), minimalPdf(`UI fixture: ${pdf}`));
  }
}

/** A tiny but structurally valid one-page PDF. */
export function minimalPdf(text) {
  const stream = `BT /F1 18 Tf 72 720 Td (${text.replace(/[()\\]/g, '')}) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = objs.map((obj, i) => {
    const offset = body.length;
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    return offset;
  });
  const xref = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((n) => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return body;
}
