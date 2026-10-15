import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { FULL, MOBILE, REAL, REAL_PROJECTS, SPARSE, settle } from './helpers';

const PAGES: Array<[string, string]> = [
  ...['/', '/about', '/portfolio', '/projects', '/blog', '/contact', '/does-not-exist', ...REAL_PROJECTS.map((s) => `/projects/${s}`)].map(
    (p) => [REAL, p] as [string, string],
  ),
  ...['/', '/portfolio', '/about', '/projects', '/projects/fixture-full-case-study', '/blog', '/blog/fixture-long-article', '/blog/fixture-short-note'].map(
    (p) => [FULL, p] as [string, string],
  ),
  ...['/', '/portfolio', '/contact'].map((p) => [SPARSE, p] as [string, string]),
];

test.describe('axe (WCAG 2.2 A/AA rules)', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const [label, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', MOBILE],
  ] as const) {
    test(`no violations on ${PAGES.length} pages at ${label}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      const found: string[] = [];
      for (const [base, path] of PAGES) {
        await page.goto(`${base}${path}`);
        await page.waitForLoadState('load');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .exclude('iframe')
          .analyze();
        for (const v of results.violations) {
          found.push(`${base}${path} [${v.impact}] ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
        }
      }
      expect(found).toEqual([]);
    });
  }
});

test('keyboard focus is always visible', async ({ page }) => {
  for (const [base, path] of [
    [REAL, '/'],
    [FULL, '/projects'],
    [FULL, '/blog/fixture-long-article'],
  ]) {
    await page.goto(`${base}${path}`);
    await settle(page);
    const seen = new Set<string>();
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        // Visually hidden radios show focus on the adjacent chip.
        const target = el.matches('.chip input') ? (el.nextElementSibling as HTMLElement) : el;
        const s = getComputedStyle(target);
        const outlined = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
        const ring = s.boxShadow !== 'none';
        const r = target.getBoundingClientRect();
        return {
          id: `${el.tagName} ${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30)}`,
          visible: outlined || ring,
          onScreen: r.width > 0 && r.height > 0,
        };
      });
      if (!info || seen.has(info.id)) continue;
      seen.add(info.id);
      expect(info.onScreen, `${base}${path}: ${info.id} focused but not rendered`).toBe(true);
      expect(info.visible, `${base}${path}: ${info.id} has no visible focus indicator`).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(5);
  }
});

test('skip link moves focus to main content', async ({ page }) => {
  await page.goto(`${REAL}/projects`);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('everything is visible immediately, without animation', async ({ page }) => {
    await page.goto(`${REAL}/about`);
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.reveal')).filter((el) => {
        const s = getComputedStyle(el);
        const moving = s.transitionProperty !== 'none' && s.transitionDuration.split(',').some((d) => parseFloat(d) > 0.001);
        return s.opacity !== '1' || s.transform !== 'none' || moving;
      }).length,
    );
    expect(hidden).toBe(0);
  });
});

test('content becomes visible when the reveal script fails', async ({ page }) => {
  await page.addInitScript(() => {
    // Simulate the reveal enhancement crashing before it can show anything.
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = function () {
      throw new Error('blocked');
    };
  });
  page.on('pageerror', () => {});
  await page.goto(`${REAL}/projects`);
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLElement>('.reveal')).every((el) => getComputedStyle(el).opacity === '1'),
        ),
      { timeout: 6000 },
    )
    .toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('content, navigation, and fallbacks remain usable', async ({ page }) => {
    for (const path of ['/', '/projects', '/projects/dragon-go', '/about', '/portfolio', '/contact']) {
      await page.goto(`${REAL}${path}`);
      const hidden = await page.evaluate(
        () => Array.from(document.querySelectorAll<HTMLElement>('.reveal')).filter((el) => getComputedStyle(el).opacity !== '1').length,
      );
      expect(hidden, `${path}: hidden reveal elements`).toBe(0);
    }
    await page.goto(`${REAL}/contact`);
    await expect(page.getByRole('link', { name: /Send an email/ })).toBeVisible();

    // Mobile without JS: the footer still links every section.
    await page.setViewportSize(MOBILE);
    await page.goto(`${REAL}/`);
    const footer = page.getByRole('contentinfo');
    for (const href of ['/about', '/portfolio', '/projects', '/blog', '/contact']) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });
});
