import { expect, test, type Page } from '@playwright/test';
import { FULL, REAL, REAL_PROJECTS, SPARSE, expectNoHorizontalOverflow } from './helpers';

const WIDTHS = [360, 390, 768, 1440];
const PAGES: Array<[string, string, string]> = [
  ...['/', '/about', '/portfolio', '/projects', '/blog', '/contact', ...REAL_PROJECTS.map((s) => `/projects/${s}`)].map(
    (p) => ['real', REAL, p] as [string, string, string],
  ),
  ...['/', '/portfolio', '/projects/fixture-full-case-study', '/blog', '/blog/fixture-long-article'].map(
    (p) => ['full', FULL, p] as [string, string, string],
  ),
  ...['/', '/portfolio', '/contact'].map((p) => ['sparse', SPARSE, p] as [string, string, string]),
];

test.use({ reducedMotion: 'reduce' });

/** Visible interactive elements whose boxes overlap (excluding nesting and decorative duplicates). */
function overlaps(page: Page) {
  return page.evaluate(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input:not([type="radio"]), select, textarea, summary')).filter((el) => {
      if (el.closest('[hidden], [aria-hidden="true"], dialog:not([open]), .mobile-menu, .skip-link')) return false;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && r.width > 1 && r.height > 1;
    });
    // Per-line fragments, so a text link wrapping across lines is not one big box.
    const boxes = els.map((el) => ({ el, rects: Array.from(el.getClientRects()) }));
    const hit = (a: DOMRect, b: DOMRect) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const out: string[] = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        if (a.rects.some((ra) => b.rects.some((rb) => hit(ra, rb)))) {
          const name = (el: HTMLElement) => `${el.tagName}(${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 25)})`;
          out.push(`${name(a.el)} × ${name(b.el)}`);
        }
      }
    }
    return out;
  });
}

for (const width of WIDTHS) {
  test(`layout at ${width}px: no page overflow, no overlapping controls, screenshots`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    for (const [build, base, path] of PAGES) {
      await page.goto(`${base}${path}`);
      await page.waitForLoadState('load');
      await page.evaluate(() => document.fonts.ready);
      const label = `${build}${path} @${width}`;
      await expectNoHorizontalOverflow(page, label);
      expect(await overlaps(page), `${label}: overlapping controls`).toEqual([]);
      const slug = `${build}${path === '/' ? '-home' : path.replaceAll('/', '-')}`;
      await page.screenshot({ path: `test-results/screenshots/${width}/${slug}.png`, fullPage: true });
    }
  });
}

test('code blocks and tables scroll inside their own region at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ['/blog/fixture-long-article', '/projects/fixture-full-case-study']) {
    await page.goto(`${FULL}${path}`);
    await expectNoHorizontalOverflow(page, path);
    const regions = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.prose pre, .prose .table-wrap, .result__scroll')).map((el) => {
        const s = getComputedStyle(el);
        return {
          tag: el.className || el.tagName,
          overflows: el.scrollWidth > el.clientWidth + 1,
          scrollable: ['auto', 'scroll'].includes(s.overflowX),
          focusable: el.tabIndex >= 0 || Boolean(el.querySelector('[tabindex="0"]')),
          fits: el.getBoundingClientRect().right <= window.innerWidth + 0.5,
        };
      }),
    );
    expect(regions.length, `${path}: code/table regions found`).toBeGreaterThan(0);
    for (const r of regions) {
      expect(r.fits, `${path}: ${r.tag} wider than the viewport`).toBe(true);
      if (r.overflows) {
        expect(r.scrollable, `${path}: ${r.tag} overflows but cannot scroll`).toBe(true);
        expect(r.focusable, `${path}: ${r.tag} scrolls but is not keyboard-focusable`).toBe(true);
      }
    }
    expect(regions.some((r) => r.overflows), `${path}: expected at least one wide region to verify scrolling`).toBe(true);
  }
});

test('images declare dimensions and alt text, and load', async ({ page }) => {
  for (const [base, path] of [
    [REAL, '/'],
    [REAL, '/projects/badminton-fairplay-queue'],
    [REAL, '/projects/library-management-system'],
    [FULL, '/blog/fixture-long-article'],
    [FULL, '/portfolio'],
  ]) {
    await page.goto(`${base}${path}`);
    await page.evaluate(async () => {
      for (const img of Array.from(document.images)) img.loading = 'eager';
      await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
    });
    const bad = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.closest('dialog'))
        .filter((img) => !img.hasAttribute('alt') || !img.getAttribute('width') || !img.getAttribute('height') || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    expect(bad, `${base}${path}`).toEqual([]);
  }
});
