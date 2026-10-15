/**
 * Builds isolated copies of the site (real content, full fixture, sparse
 * fixture, and deliberately broken content) and asserts on the real `dist/`
 * artifacts: routes, links, metadata, sitemap/RSS/robots/OG, privacy, and
 * fallbacks. Run with `npm run test:build`.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { before, describe, it } from 'node:test';
import { FIXTURE_ORIGIN, auditPrivacy, buildFixture, prepareFixture, repoRoot } from '../../scripts/ui-fixture/lib.mjs';
import { scenarios } from '../../scripts/ui-fixture/overrides.mjs';
import { attr, canonical, htmlPages, links, meta, read, resolvesInDist, routeOf, tags, text, xmlLocs } from './html.mjs';

const REAL_PROJECTS = ['badminton-fairplay-queue', 'dragon-go', 'library-management-system', 'retail-sales-analysis'];

function build(name, scenario) {
  const out = prepareFixture(name, scenario);
  const result = buildFixture(out, { quiet: true });
  assert.ok(result.ok, `${name} build failed:\n${result.output.slice(-3000)}`);
  return result.dist;
}

/** Invariants every build must satisfy, regardless of content. */
function assertSiteInvariants(dist) {
  const pages = htmlPages(dist);
  const problems = [];
  for (const rel of pages) {
    const html = read(dist, rel);
    const route = routeOf(rel);
    const where = `${rel}:`;
    const noindex = meta(html, 'robots')?.includes('noindex');

    if (!/<html[^>]*\slang="en"/.test(html)) problems.push(`${where} missing lang="en"`);
    if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${where} empty <title>`);
    if (!meta(html, 'description')) problems.push(`${where} missing meta description`);
    const h1s = tags(html, 'h1').length;
    if (h1s !== 1) problems.push(`${where} ${h1s} <h1> elements`);
    const head = html.slice(0, html.indexOf('</head>'));
    if (!/<style[^>]*>\s*@view-transition\s*\{\s*navigation:\s*auto;?\s*\}/.test(head)) {
      problems.push(`${where} view-transition opt-in is not inlined in <head>`);
    }

    if (noindex) {
      if (canonical(html)) problems.push(`${where} noindex page declares a canonical URL`);
    } else {
      const expected = `${FIXTURE_ORIGIN}${route}`;
      if (canonical(html) !== expected) problems.push(`${where} canonical ${canonical(html)} ≠ ${expected}`);
      if (meta(html, 'og:url') !== expected) problems.push(`${where} og:url ${meta(html, 'og:url')} ≠ ${expected}`);
    }
    const ogImage = meta(html, 'og:image') ?? '';
    if (!ogImage.startsWith(`${FIXTURE_ORIGIN}/`) || !resolvesInDist(dist, ogImage.slice(FIXTURE_ORIGIN.length))) {
      problems.push(`${where} og:image does not resolve: ${ogImage}`);
    }

    for (const { kind, url } of links(html)) {
      if (kind === 'href' && (url === '' || url === '#' || url.startsWith('javascript:'))) problems.push(`${where} placeholder href="${url}"`);
      if (url.startsWith('/') && !url.startsWith('//') && !resolvesInDist(dist, url)) problems.push(`${where} broken internal ${kind} ${url}`);
      if (url.startsWith('http://') && !url.startsWith('http://www.w3.org')) problems.push(`${where} insecure URL ${url}`);
    }
    for (const a of tags(html, 'a')) {
      if (attr(a, 'target') === '_blank' && !/noopener/.test(attr(a, 'rel') ?? '')) problems.push(`${where} target=_blank without noopener: ${a}`);
    }
    for (const img of tags(html, 'img')) {
      if (!/\salt="/.test(img)) problems.push(`${where} <img> without alt: ${img.slice(0, 120)}`);
      if (attr(img, 'src') && !(attr(img, 'width') && attr(img, 'height'))) problems.push(`${where} <img> without width/height: ${attr(img, 'src')}`);
    }
    for (const el of [...tags(html, 'img'), ...tags(html, 'video'), ...tags(html, 'source')]) {
      for (const name of ['src', 'poster']) {
        const value = attr(el, name);
        if (value?.startsWith('/') && !resolvesInDist(dist, value)) problems.push(`${where} ${name}="${value}" does not exist in the build`);
      }
    }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) problems.push(`${where} duplicate ids ${[...new Set(dupes)].join(', ')}`);

    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    levels.forEach((level, i) => {
      if (i > 0 && level > levels[i - 1] + 1) problems.push(`${where} heading jumps h${levels[i - 1]} → h${level}`);
    });
  }

  const sitemap = read(dist, 'sitemap-0.xml');
  const locs = xmlLocs(sitemap);
  const indexable = pages
    .filter((rel) => !meta(read(dist, rel), 'robots')?.includes('noindex'))
    .map((rel) => `${FIXTURE_ORIGIN}${routeOf(rel)}`)
    .sort();
  assert.deepEqual([...locs].sort(), indexable, 'sitemap must list exactly the indexable pages');
  assert.match(read(dist, 'sitemap-index.xml'), new RegExp(`${FIXTURE_ORIGIN}/sitemap-0.xml`));
  assert.match(read(dist, 'robots.txt'), new RegExp(`Sitemap: ${FIXTURE_ORIGIN}/sitemap-index.xml`));
  assert.ok(existsSync(join(dist, '404.html')), '404.html exists');

  assert.deepEqual(problems, [], `site invariants:\n- ${problems.join('\n- ')}`);
  assert.deepEqual(auditPrivacy(dist), [], 'no draft/future/template output');
  return pages;
}

describe('real content build', { concurrency: false }, () => {
  let dist;
  before(() => {
    dist = build('test-real', {});
  });

  it('emits every public route and no blog detail while the blog is empty', () => {
    const pages = assertSiteInvariants(dist).map(routeOf).sort();
    assert.deepEqual(pages, ['/', '/404', '/about', '/blog', '/contact', '/portfolio', '/projects', ...REAL_PROJECTS.map((s) => `/projects/${s}`)].sort());
    for (const slug of REAL_PROJECTS) assert.ok(existsSync(join(dist, `og/projects/${slug}.png`)), `og for ${slug}`);
  });

  it('has no RSS feed or feed link while no post is published, and the empty blog links to Projects', () => {
    assert.equal(existsSync(join(dist, 'rss.xml')), false);
    for (const rel of htmlPages(dist)) assert.doesNotMatch(read(dist, rel), /application\/rss\+xml/, rel);
    const blog = read(dist, 'blog.html');
    assert.match(blog, /href="\/projects"/);
    assert.doesNotMatch(blog, /data-filter="posts"/, 'no filter UI without posts');
  });

  it('shows no resume, verify, or placeholder UI without that content', () => {
    for (const rel of htmlPages(dist)) {
      const html = read(dist, rel);
      assert.doesNotMatch(html, /\sdownload[\s=>]/, `${rel}: download link without a resume`);
      assert.doesNotMatch(text(html), /Coming soon|TODO|Lorem ipsum|Verify Credential/i, rel);
    }
  });

  it('keeps existing real content, routes and social links', () => {
    const home = read(dist, 'index.html');
    assert.match(text(home), /Huynh Viet Hung/);
    assert.match(text(home), /Three featured projects/);
    for (const slug of ['dragon-go', 'library-management-system', 'badminton-fairplay-queue']) assert.match(home, new RegExp(`href="/projects/${slug}"`));
    assert.match(text(home), /All 4 projects/);
    const contact = read(dist, 'contact.html');
    assert.match(contact, /href="mailto:huynhviethung070224@gmail\.com"/);
    assert.match(contact, /linkedin\.com/);
    assert.match(contact, /github\.com/);
    const portfolio = read(dist, 'portfolio.html');
    for (const slug of REAL_PROJECTS) assert.match(portfolio, new RegExp(`href="/projects/${slug}"`), `skill evidence → ${slug}`);
    assert.match(text(portfolio), /Databases and SQL for Data Science/);
    assert.match(text(portfolio), /TPCOMS/);
    assert.match(text(read(dist, 'about.html')), /Drexel Vietnamese Student Association/);
  });

  it('marks the current page in navigation', () => {
    assert.match(read(dist, 'projects/dragon-go.html'), /href="\/projects"[^>]*aria-current="page"/);
    assert.match(read(dist, 'contact.html'), /href="\/contact"[^>]*aria-current="page"/);
  });
});

describe('full fixture build (every optional field)', { concurrency: false }, () => {
  let dist;
  before(() => {
    dist = build('test-full', scenarios.full);
  });

  it('passes the site invariants and excludes drafts, future posts and templates everywhere', () => {
    assertSiteInvariants(dist);
    for (const rel of ['blog/fixture-draft.html', 'blog/fixture-future.html', 'projects/fixture-draft-project.html', 'og/blog/fixture-draft.png', 'og/blog/fixture-future.png']) {
      assert.equal(existsSync(join(dist, rel)), false, rel);
    }
    for (const rel of htmlPages(dist)) {
      assert.doesNotMatch(read(dist, rel), /Fixture Draft Tech|Fixture draft category/, `${rel}: draft project data leaked into filters/lists`);
    }
  });

  it('publishes valid posts to list, routes, RSS, sitemap, OG, related, and filters', () => {
    const rss = read(dist, 'rss.xml');
    assert.deepEqual(
      [...rss.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]).filter((l) => l.includes('/blog/')).sort(),
      [`${FIXTURE_ORIGIN}/blog/fixture-long-article`, `${FIXTURE_ORIGIN}/blog/fixture-short-note`],
    );
    const sitemap = read(dist, 'sitemap-0.xml');
    assert.match(sitemap, /\/blog\/fixture-long-article</);
    assert.ok(existsSync(join(dist, 'og/blog/fixture-long-article.png')));
    const list = read(dist, 'blog.html');
    assert.match(list, /data-filter="posts"/);
    assert.equal((list.match(/data-filter-item="posts"/g) ?? []).length, 2);
    assert.match(list, /type="application\/rss\+xml"/);
    const article = read(dist, 'blog/fixture-long-article.html');
    assert.match(text(article), /Related articles/);
    assert.match(article, /href="\/blog\/fixture-short-note"/);
    assert.match(article, /data-toc/);
    assert.match(article, /href="\/blog\?tag=sql"/);
    assert.match(article, /<code tabindex="0">/);
    assert.equal(meta(article, 'og:type'), 'article');
    assert.doesNotMatch(read(dist, 'blog/fixture-short-note.html'), /data-toc/, 'short post has no TOC');
    assert.match(text(read(dist, 'index.html')), /Fixture short note/);
  });

  it('renders every optional profile module once configured, with working local files', () => {
    const home = read(dist, 'index.html');
    assert.match(home, /href="\/resume\/fixture-resume\.pdf"[^>]*download/);
    assert.match(home, /src="\/about\/fixture-portrait\.png"/);
    assert.match(text(home), /Open to Fixture Role A/);
    assert.match(text(home), /Four featured projects/, 'new featured project counted; featured draft excluded');
    const pdf = readFileSync(join(dist, 'resume/fixture-resume.pdf'));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');

    const portfolio = read(dist, 'portfolio.html');
    const portfolioText = text(portfolio);
    for (const needle of ['Professional experience', 'Fixture contribution one', 'Fixture SQL', 'Fixture Leadership Role', 'Verify Credential', 'Credential ID', 'View certificate', 'Fixture certificate with title only']) {
      assert.match(portfolioText, new RegExp(needle), needle);
    }
    assert.match(portfolio, /href="https:\/\/example\.com\/verify\/fixture"[^>]*target="_blank"/);
    assert.match(portfolio, /href="\/certificates\/fixture-cert\.pdf"/);
    assert.match(portfolio, /data-lightbox[^>]*|href="\/certificates\/fixture-cert\.webp"/);
    assert.equal((portfolio.match(/Verify Credential/g) ?? []).length, 1, 'Verify only where a URL exists');
    assert.match(read(dist, 'about.html'), /src="\/about\/fixture-portrait\.png"/);
  });

  it('renders every case-study module from data without component changes', () => {
    const page = read(dist, 'projects/fixture-full-case-study.html');
    for (const id of ['project-demo', 'project-analysis', 'project-results', 'project-outcomes', 'project-challenges', 'project-lessons', 'project-gallery', 'project-resources']) {
      assert.match(page, new RegExp(`id="${id}"`), id);
      assert.match(page, new RegExp(`href="#${id}"`), `TOC entry ${id}`);
    }
    assert.match(page, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/aqz-KE-bpKQ"/);
    assert.match(page, /href="https:\/\/example\.com\/fixture-video-page"[^>]*target="_blank"/);
    assert.match(page, /href="#project-demo"/, 'Watch demo video jump link');
    assert.match(text(page), /Demo note Fixture demo note/);
    assert.match(page, /<td[^>]*>2026-01-02<\/td>/);
    assert.match(page, /<td[^>]*>NULL<\/td>/);
    assert.match(page, /role="region"[^>]*tabindex="0"/);
    assert.equal((page.match(/data-lightbox-group="fixture-full-case-study-gallery"/g) ?? []).length, 3);
    assert.match(read(dist, 'projects.html'), /href="\/projects\/fixture-full-case-study"/);
  });

  it('builds project facets only from published data', () => {
    const projects = read(dist, 'projects.html');
    assert.match(projects, /data-filter="projects"/);
    for (const option of ['Web app', 'Database &amp; SQL', 'Data analysis']) assert.match(projects, new RegExp(`value="${option}"`), option);
    assert.equal((projects.match(/data-filter-item="projects"/g) ?? []).length, 5);
  });
});

describe('sparse fixture build (optional modules empty)', { concurrency: false }, () => {
  let dist;
  before(() => {
    dist = build('test-sparse', scenarios.sparse);
  });

  it('builds without resume, portrait, email, experience, leadership, or certificates', () => {
    assertSiteInvariants(dist);
    const all = htmlPages(dist).map((rel) => read(dist, rel)).join('\n');
    assert.doesNotMatch(all, /mailto:/);
    assert.doesNotMatch(all, /\sdownload[\s=>]/);
    assert.doesNotMatch(all, /data-copy-btn/);
    const portfolio = text(read(dist, 'portfolio.html'));
    assert.doesNotMatch(portfolio, /Professional experience|Community involvement|Credentials/);
    assert.match(portfolio, /Education/);
    const about = read(dist, 'about.html');
    assert.doesNotMatch(text(about), /Work experience|Leadership & activities/);
    assert.match(about, /monogram|portrait--fallback/);
    assert.match(text(read(dist, 'contact.html')), /LinkedIn/);
  });
});

describe('invalid content fails the build with a clear message', { concurrency: false }, () => {
  const dragon = readFileSync(join(repoRoot, 'src/content/projects/dragon-go.md'), 'utf8');
  const cases = [
    ['duplicate slug via frontmatter', { files: { 'src/content/projects/zz-copy.md': dragon.replace('---\n', '---\nslug: dragon-go\n') } }, /duplicate slug "dragon-go"/],
    ['skill group → unknown project', { skillGroups: [{ title: 'x', projectSlug: 'not-a-project', projectTitle: 'x', role: 'x', skills: ['x'], contributions: [] }] }, /"not-a-project" does not match a published project/],
    ['skill group → project switched to draft', { files: { 'src/content/projects/dragon-go.md': dragon.replace('---\n', '---\ndraft: true\n') } }, /"dragon-go" does not match a published project/],
    ['evidence link → unknown project', { site: { workExperience: [{ title: 'x', organization: 'y', order: 1, evidenceLinks: [{ label: 'x', url: '/projects/nope' }] }] } }, /evidenceLinks\[0\]\.url: "\/projects\/nope" does not match a published project/],
    ['evidence link → "#"', { site: { leadership: [{ title: 'x', organization: 'y', order: 1, evidenceLinks: [{ label: 'x', url: '#' }] }] } }, /placeholder or empty URLs are not allowed/],
    ['missing project image', { files: { 'src/content/projects/zz-missing.md': dragon.replace(/src: \/projects\/dragon-go\/home\.webp/, 'src: /projects/nope/missing.png') } }, /coverImage\.src: local asset: "\/projects\/nope\/missing\.png" does not exist/],
    ['missing resume PDF', { site: { resume: { path: '/resume/missing.pdf' } } }, /site\.resume\.path: "\/resume\/missing\.pdf" does not exist/],
    ['resume that is not a PDF', { site: { resume: { path: '/favicon.svg' } } }, /resume asset must be a PDF/],
    ['missing portrait', { site: { portrait: { src: '/about/missing.jpg', alt: 'x', width: 1, height: 1 } } }, /site\.portrait\.src: "\/about\/missing\.jpg" does not exist/],
    ['missing certificate file', { certificates: [{ title: 'x', order: 1, asset: { type: 'pdf', src: '/certificates/missing.pdf' } }] }, /certificates\[0\]\.asset\.src/],
    ['placeholder demo URL', { files: { 'src/content/projects/zz-hash.md': dragon.replace('---\n', '---\ndemoUrl: "#"\n') } }, /demoUrl/],
    ['result table row width mismatch', { files: { 'src/content/projects/zz-table.md': dragon.replace('---\n', '---\nresults:\n  - type: table\n    title: T\n    columns: [a, b]\n    rows:\n      - [only-one]\n') } }, /Expected 2 cells/],
  ];
  for (const [name, scenario, message] of cases) {
    it(name, () => {
      const out = prepareFixture(`test-invalid-${name.replace(/\W+/g, '-')}`, scenario);
      const result = buildFixture(out, { quiet: true });
      assert.equal(result.ok, false, `${name}: build should fail`);
      assert.match(result.output, message);
    });
  }
});
