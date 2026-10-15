import { expect, test } from '@playwright/test';
import { FULL, REAL, REAL_PROJECTS, SPARSE, settle, trackErrors } from './helpers';

test.describe('main journey @cross-browser', () => {
  test('Home → Projects → every case study → About → Portfolio → Blog → Contact by clicking', async ({ page }) => {
    const errors = trackErrors(page);
    const nav = page.getByRole('navigation', { name: 'Primary' });

    await page.goto(`${REAL}/`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Huynh Viet Hung');
    await expect(page.getByRole('heading', { name: 'Three featured projects' })).toBeVisible();

    await page.getByRole('link', { name: 'View Projects' }).click();
    await expect(page).toHaveURL(`${REAL}/projects`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    for (const slug of REAL_PROJECTS) {
      await settle(page);
      await page.locator(`main a[href="/projects/${slug}"]:not([aria-hidden="true"])`).first().click();
      await expect(page).toHaveURL(`${REAL}/projects/${slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
      await settle(page);
      await page.getByRole('link', { name: 'Back to Projects' }).first().click();
      await expect(page).toHaveURL(`${REAL}/projects`);
    }

    for (const [name, path, heading] of [
      ['About Me', '/about', /./],
      ['Portfolio', '/portfolio', /./],
      ['Blog', '/blog', /./],
      ['Contact', '/contact', /./],
    ] as const) {
      await settle(page);
      await nav.getByRole('link', { name }).click();
      await expect(page).toHaveURL(`${REAL}${path}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(nav.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
    }
    expect(errors).toEqual([]);
  });
});

test('existing URLs still resolve and unknown URLs get the 404 page', async ({ request }) => {
  for (const path of ['/', '/about', '/portfolio', '/projects', '/blog', '/contact', ...REAL_PROJECTS.map((s) => `/projects/${s}`), '/sitemap-index.xml', '/robots.txt', '/favicon.svg']) {
    const res = await request.get(`${REAL}${path}`);
    expect(res.status(), path).toBe(200);
  }
  const missing = await request.get(`${REAL}/does-not-exist`);
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('href="/"');
  expect((await request.get(`${REAL}/rss.xml`)).status(), 'no feed while the blog is empty').toBe(404);
  expect((await request.get(`${FULL}/rss.xml`)).status()).toBe(200);
});

test('no website errors on any page of the real, full, and sparse builds', async ({ page }) => {
  const errors = trackErrors(page);
  const pages: Array<[string, string[]]> = [
    [REAL, ['/', '/about', '/portfolio', '/projects', ...REAL_PROJECTS.map((s) => `/projects/${s}`), '/blog', '/contact', '/does-not-exist']],
    [FULL, ['/', '/about', '/portfolio', '/projects', '/projects/fixture-full-case-study', '/blog', '/blog/fixture-long-article', '/blog/fixture-short-note', '/contact']],
    [SPARSE, ['/', '/about', '/portfolio', '/projects', '/blog', '/contact']],
  ];
  for (const [base, paths] of pages) {
    for (const path of paths) {
      await page.goto(`${base}${path}`, { waitUntil: 'load' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(150);
    }
  }
  expect(errors).toEqual([]);
});

test('optional links never become "#" or empty buttons', async ({ page }) => {
  for (const base of [REAL, FULL, SPARSE]) {
    for (const path of ['/', '/about', '/portfolio', '/projects', '/blog', '/contact', base === FULL ? '/projects/fixture-full-case-study' : '/projects/dragon-go']) {
      await page.goto(`${base}${path}`);
      const bad = await page.evaluate(() => {
        const problems: string[] = [];
        for (const a of document.querySelectorAll('a')) {
          const href = a.getAttribute('href');
          if (href === null || href === '' || href === '#' || href.startsWith('javascript:')) problems.push(`a[href="${href}"] ${a.textContent?.trim()}`);
        }
        for (const el of document.querySelectorAll<HTMLElement>('a, button')) {
          if (el.closest('[hidden], [aria-hidden="true"]') || el.getClientRects().length === 0) continue;
          const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
          if (!name) problems.push(`unnamed ${el.tagName} ${el.outerHTML.slice(0, 80)}`);
        }
        return problems;
      });
      expect(bad, `${base}${path}`).toEqual([]);
    }
  }
});
