import { expect, test, type Page } from '@playwright/test';
import { MOBILE, REAL, settle } from './helpers';

test.use({ viewport: MOBILE });

const openButton = (page: Page) => page.getByRole('button', { name: 'Open menu' });
const menu = (page: Page) => page.getByRole('dialog', { name: 'Site menu' });

async function expectClosed(page: Page) {
  await expect(menu(page)).toBeHidden();
  await expect(openButton(page)).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
}

test.describe('mobile menu @cross-browser', () => {
  test('opens and closes with button, Escape, backdrop, and close button', async ({ page }) => {
    await page.goto(`${REAL}/projects`);
    await settle(page);
    await expect(page.getByRole('navigation', { name: 'Primary', exact: true })).toBeHidden();

    await openButton(page).click();
    await expect(menu(page)).toBeVisible();
    await expect(openButton(page)).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await expect(menu(page).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    // The overlay must cover the viewport (a filtered ancestor once clipped it to the header in Safari).
    const panel = await menu(page).boundingBox();
    expect(panel?.height).toBe(MOBILE.height);
    for (const name of ['Home', 'About Me', 'Portfolio', 'Projects', 'Blog', 'Contact']) {
      await expect(menu(page).getByRole('link', { name, exact: true })).toBeInViewport();
    }

    await page.keyboard.press('Escape');
    await expectClosed(page);
    await expect(openButton(page)).toBeFocused();

    await openButton(page).click();
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expectClosed(page);

    await openButton(page).click();
    await page.locator('[data-menu-backdrop]').click({ position: { x: 8, y: 400 } });
    await expectClosed(page);

    // Choosing the current page closes the menu and stays.
    await openButton(page).click();
    await menu(page).getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(`${REAL}/projects`);
    await expect(menu(page)).toBeHidden();
  });

  test('keyboard: open with Enter, focus starts inside, Tab is trapped', async ({ page }) => {
    await page.goto(`${REAL}/`);
    await settle(page);
    await openButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toBeVisible();

    const inside = () => page.evaluate(() => Boolean(document.activeElement?.closest('[aria-label="Site menu"]')));
    expect(await inside()).toBe(true);
    const count = await menu(page).locator('a[href], button').count();
    for (let i = 0; i < count + 2; i += 1) {
      await page.keyboard.press('Tab');
      expect(await inside(), `focus escaped the menu after ${i + 1} Tab presses`).toBe(true);
    }
    for (let i = 0; i < count + 2; i += 1) {
      await page.keyboard.press('Shift+Tab');
      expect(await inside(), `focus escaped the menu after ${i + 1} Shift+Tab presses`).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expectClosed(page);
    await expect(openButton(page)).toBeFocused();
  });

  test('one toggle per click after many navigations and history restores', async ({ page }) => {
    await page.goto(`${REAL}/`);
    for (const name of ['Projects', 'About Me', 'Portfolio', 'Blog', 'Contact', 'Home']) {
      await settle(page);
      await openButton(page).click();
      await menu(page).getByRole('link', { name, exact: true }).click();
      await expect(menu(page)).toBeHidden();
    }
    await settle(page);
    await page.goBack();
    await settle(page);
    await page.goForward();
    await settle(page);

    // A duplicated listener would open and immediately close (or open twice and break Escape).
    await openButton(page).click();
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expectClosed(page);
    await openButton(page).click();
    await expect(menu(page)).toBeVisible();
  });

  test('menu closes when the viewport grows to desktop', async ({ page }) => {
    await page.goto(`${REAL}/about`);
    await settle(page);
    await openButton(page).click();
    await expect(menu(page)).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('[data-mobile-menu]')).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    await expect(page.getByRole('navigation', { name: 'Primary', exact: true })).toBeVisible();
  });
});
