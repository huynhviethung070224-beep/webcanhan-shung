import { expect, test } from '@playwright/test';
import { FULL, REAL, SPARSE, settle } from './helpers';

test.describe('resume present (fixture PDF)', () => {
  test('download and view links point to a real PDF', async ({ page, request, browserName }) => {
    await page.goto(`${FULL}/portfolio`);
    await settle(page);
    const download = page.getByRole('link', { name: /Download Resume/ }).first();
    await expect(download).toHaveAttribute('download', 'fixture-resume.pdf');
    const href = await download.getAttribute('href');
    expect(href).toBe('/resume/fixture-resume.pdf');

    const res = await request.get(`${FULL}${href}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('application/pdf');
    expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');

    if (browserName === 'chromium') {
      const [file] = await Promise.all([page.waitForEvent('download'), download.click()]);
      expect(file.suggestedFilename()).toBe('fixture-resume.pdf');
    }

    const view = page.getByRole('link', { name: /View Resume/ }).first();
    await expect(view).toHaveAttribute('target', '_blank');
    await expect(view).toHaveAttribute('rel', /noopener/);
    await expect(view).toHaveAttribute('href', href!);

    await page.goto(`${FULL}/`);
    await expect(page.getByRole('link', { name: /Download Resume/ }).first()).toHaveAttribute('href', href!);
  });
});

test.describe('resume and optional profile content absent', () => {
  for (const base of [REAL, SPARSE]) {
    test(`no resume buttons, placeholders, or dead links on ${base === REAL ? 'real content' : 'sparse fixture'}`, async ({ page }) => {
      for (const path of ['/', '/about', '/portfolio', '/contact']) {
        await page.goto(`${base}${path}`);
        await expect(page.getByRole('link', { name: /Resume/i })).toHaveCount(0);
        await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
        await expect(page.locator('main')).not.toContainText(/coming soon|lorem ipsum|TODO|placeholder/i);
      }
    });
  }

  test('sparse profile hides empty sections and falls back gracefully', async ({ page }) => {
    await page.goto(`${SPARSE}/portfolio`);
    for (const heading of ['Professional experience', 'Community involvement', 'Credentials', 'The current resume']) {
      await expect(page.getByRole('heading', { name: heading })).toHaveCount(0);
    }
    await expect(page.getByRole('heading', { name: 'Prefer a conversation?' })).toBeVisible();

    await page.goto(`${SPARSE}/contact`);
    await expect(page.getByRole('button', { name: 'Copy email' })).toHaveCount(0);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Social profiles' })).toBeAttached();

    await page.goto(`${SPARSE}/about`);
    await expect(page.locator('main img[src*="/about/"]')).toHaveCount(0);

    await page.goto(`${SPARSE}/`);
    await expect(page.getByText(/Available from|Open to/)).toHaveCount(0);
  });

  test('full profile shows experience, leadership, certificates, availability, and portrait', async ({ page }) => {
    await page.goto(`${FULL}/portfolio`);
    for (const heading of ['Professional experience', 'Community involvement', 'Credentials']) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
    await page.goto(`${FULL}/`);
    await expect(page.getByText('Available from Fixture date')).toBeVisible();
    await page.goto(`${FULL}/about`);
    const portrait = page.locator('main img[src*="/about/"]').first();
    await expect(portrait).toBeVisible();
    expect(await portrait.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  });
});

test.describe('blog states', () => {
  test('empty blog points to projects; populated blog lists only published posts', async ({ page }) => {
    for (const base of [REAL, SPARSE]) {
      await page.goto(`${base}/blog`);
      await expect(page.getByRole('heading', { name: 'The first article is still being written.' })).toBeVisible();
      await expect(page.locator('main a[href="/projects"]').first()).toBeVisible();
      await expect(page.getByRole('search')).toHaveCount(0);
    }
    await page.goto(`${FULL}/blog`);
    await expect(page.locator('[data-filter-item="posts"]')).toHaveCount(2);
    await expect(page.locator('main')).not.toContainText(/Draft fixture|Future fixture/);
    for (const path of ['/blog/fixture-draft', '/blog/fixture-future', '/projects/fixture-draft-project', '/blog/_template-new-post']) {
      expect((await page.request.get(`${FULL}${path}`)).status(), path).toBe(404);
    }
  });

  test('a case study shows its video embed and project media', async ({ page }) => {
    await page.goto(`${FULL}/projects/fixture-full-case-study`);
    const frame = page.locator('iframe[src*="youtube-nocookie.com/embed/"]');
    await expect(frame).toHaveAttribute('title', /.+/);
    await expect(frame).toHaveAttribute('loading', 'lazy');
    await expect(page.locator('nav[data-toc]')).toBeAttached();
  });
});
