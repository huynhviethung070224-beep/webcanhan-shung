import { expect, test, type Locator, type Page } from '@playwright/test';
import { FULL, REAL, settle } from './helpers';

const viewer = (page: Page) => page.getByRole('dialog', { name: 'Image viewer' });
const counter = (page: Page) => page.locator('[data-lightbox-count]');

async function expectImageLoaded(page: Page) {
  const img = viewer(page).locator('[data-lightbox-img]');
  await expect(img).toHaveAttribute('src', /.+/);
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  expect((await img.getAttribute('alt'))?.trim(), 'viewer image has alt text').toBeTruthy();
}

async function largestGroup(page: Page): Promise<{ name: string; links: Locator }> {
  const name = await page.evaluate(() => {
    const counts = new Map<string, number>();
    document.querySelectorAll<HTMLElement>('a[data-lightbox][data-lightbox-group]').forEach((a) => {
      counts.set(a.dataset.lightboxGroup!, (counts.get(a.dataset.lightboxGroup!) ?? 0) + 1);
    });
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  });
  return { name, links: page.locator(`a[data-lightbox][data-lightbox-group="${name}"]`) };
}

test.describe('gallery lightbox @cross-browser', () => {
  test('open, browse with buttons and arrows, close with button / Escape / backdrop, focus returns', async ({ page }) => {
    await page.goto(`${FULL}/projects/fixture-full-case-study`);
    await settle(page);
    const { links } = await largestGroup(page);
    const total = await links.count();
    expect(total, 'fixture gallery has several images').toBeGreaterThanOrEqual(3);

    const first = links.first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await expect(viewer(page)).toBeVisible();
    await expect(counter(page)).toHaveText(`Image 1 of ${total}`);
    await expect(page.getByRole('button', { name: 'Close image viewer' })).toBeFocused();
    await expectImageLoaded(page);

    await page.getByRole('button', { name: 'Next image' }).click();
    await expect(counter(page)).toHaveText(`Image 2 of ${total}`);
    await expectImageLoaded(page);
    await page.keyboard.press('ArrowRight');
    await expect(counter(page)).toHaveText(`Image 3 of ${total}`);
    await page.getByRole('button', { name: 'Previous image' }).click();
    await page.keyboard.press('ArrowLeft');
    await expect(counter(page)).toHaveText(`Image 1 of ${total}`);
    await page.keyboard.press('ArrowLeft');
    await expect(counter(page), 'wraps to the last image').toHaveText(`Image ${total} of ${total}`);

    await page.keyboard.press('Escape');
    await expect(viewer(page)).toBeHidden();
    await expect(first).toBeFocused();
    expect(await page.locator('[data-lightbox-img]').getAttribute('src')).toBeNull();

    // Keyboard open, close button.
    await links.nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(counter(page)).toHaveText(`Image 2 of ${total}`);
    await page.getByRole('button', { name: 'Close image viewer' }).click();
    await expect(viewer(page)).toBeHidden();
    await expect(links.nth(1)).toBeFocused();

    // Backdrop (the dialog surface outside image and controls).
    await first.click();
    await expect(viewer(page)).toBeVisible();
    const vp = page.viewportSize()!;
    await page.mouse.click(vp.width / 2, vp.height - 6);
    await expect(viewer(page)).toBeHidden();
    await expect(first).toBeFocused();
  });

  test('a single image opens without previous/next controls', async ({ page }) => {
    await page.goto(`${REAL}/projects/library-management-system`);
    await settle(page);
    const link = page.locator('a[data-lightbox]').first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(viewer(page)).toBeVisible();
    await expectImageLoaded(page);
    const grouped = await link.getAttribute('data-lightbox-group');
    const size = grouped ? await page.locator(`a[data-lightbox][data-lightbox-group="${grouped}"]`).count() : 1;
    if (size === 1) {
      await expect(page.getByRole('button', { name: 'Next image' })).toBeHidden();
      await expect(counter(page)).toHaveText('');
    }
    await page.keyboard.press('Escape');
    await expect(link).toBeFocused();
  });

  test('certificate images open in the viewer', async ({ page }) => {
    await page.goto(`${FULL}/portfolio`);
    await settle(page);
    const cert = page.locator('a[data-lightbox]').first();
    await cert.scrollIntoViewIfNeeded();
    await cert.click();
    await expect(viewer(page)).toBeVisible();
    await expectImageLoaded(page);
    await page.keyboard.press('Escape');
    await expect(cert).toBeFocused();
  });

  test('without JavaScript an image link opens the image file', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${FULL}/projects/fixture-full-case-study`);
    const href = await page.locator('a[data-lightbox]').first().getAttribute('href');
    const res = await page.request.get(`${FULL}${href}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/^image\//);
    await context.close();
  });
});
