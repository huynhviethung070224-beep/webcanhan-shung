import { expect, test, type Page } from '@playwright/test';
import { FULL, MOBILE, REAL, grantClipboard, readClipboard, settle, trackErrors } from './helpers';

const EMAIL = 'huynhviethung070224@gmail.com';

/** Counts clipboard writes in the current document; optionally makes them fail or hang. */
async function instrumentClipboard(page: Page, mode: 'real' | 'denied' | 'hang' = 'real') {
  await page.addInitScript((mode) => {
    const w = window as unknown as { __writes: number };
    w.__writes = 0;
    const clip = navigator.clipboard;
    if (!clip) return;
    const original = clip.writeText.bind(clip);
    clip.writeText = (text: string) => {
      w.__writes += 1;
      if (mode === 'denied') return Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError'));
      if (mode === 'hang') return new Promise<void>(() => {});
      return original(text);
    };
    if (mode === 'denied') document.execCommand = () => false;
    if (mode === 'hang') document.execCommand = () => true;
  }, mode);
}

const writes = (page: Page) => page.evaluate(() => (window as unknown as { __writes: number }).__writes);

async function copyEmailAndExpectSuccess(page: Page, browserName: string) {
  const button = page.getByRole('button', { name: 'Copy email' });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole('button', { name: 'Email copied' })).toBeVisible();
  await expect(page.locator('[data-copy-status]')).toHaveText(`Email copied: ${EMAIL}`);
  await expect(page.locator('[data-copy-manual]')).toBeHidden();
  const clip = await readClipboard(page, browserName);
  if (clip !== null) expect(clip).toBe(EMAIL);
  // Feedback resets so the next copy is visible too.
  await expect(page.getByRole('button', { name: 'Copy email' })).toBeVisible({ timeout: 4000 });
}

test.describe('copy email @cross-browser', () => {
  test.beforeEach(async ({ context, browserName }) => grantClipboard(context, browserName));

  test('reaching Contact from every page through the primary nav, then copying', async ({ page, browserName }) => {
    const errors = trackErrors(page);
    for (const start of ['/', '/projects', '/projects/dragon-go', '/about', '/portfolio', '/blog']) {
      await page.goto(`${REAL}${start}`);
      await settle(page);
      await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).click();
      await expect(page).toHaveURL(`${REAL}/contact`);
      await settle(page);
      await copyEmailAndExpectSuccess(page, browserName);
    }
    expect(errors).toEqual([]);
  });

  test('reaching Contact through the mobile menu, then copying', async ({ page, browserName }) => {
    await page.setViewportSize(MOBILE);
    for (const start of ['/', '/projects/badminton-fairplay-queue', '/portfolio']) {
      await page.goto(`${REAL}${start}`);
      await settle(page);
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'Contact' }).click();
      await expect(page).toHaveURL(`${REAL}/contact`);
      await settle(page);
      await copyEmailAndExpectSuccess(page, browserName);
    }
  });

  test('copy still works after back, forward, and reload, with one write per click', async ({ page, browserName }) => {
    await instrumentClipboard(page);
    await page.goto(`${REAL}/contact`);
    await settle(page);
    await copyEmailAndExpectSuccess(page, browserName);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const name of ['About Me', 'Projects', 'Portfolio']) {
      await nav.getByRole('link', { name }).click();
      await settle(page);
      await page.goBack();
      await expect(page).toHaveURL(`${REAL}/contact`);
      await settle(page);
      await page.goForward();
      await settle(page);
      await page.goBack();
      await settle(page);
    }
    await expect(page.getByRole('button', { name: 'Copy email' }), 'stale "copied" state after history navigation').toBeVisible();
    const before = await writes(page);
    await copyEmailAndExpectSuccess(page, browserName);
    expect((await writes(page)) - before, 'clipboard writes for a single click').toBe(1);

    await page.reload();
    await settle(page);
    await copyEmailAndExpectSuccess(page, browserName);
    expect(await writes(page)).toBe(1);
  });

  test('clipboard denied shows a selected manual-copy field', async ({ page }) => {
    await instrumentClipboard(page, 'denied');
    await page.goto(`${REAL}/contact`);
    await settle(page);
    await page.getByRole('button', { name: 'Copy email' }).click();

    const field = page.getByRole('textbox', { name: 'Copy email: value to copy manually' });
    await expect(field).toBeVisible();
    await expect(field).toHaveValue(EMAIL);
    await expect(field).toBeFocused();
    const selection = await field.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd]);
    expect(selection).toEqual([0, EMAIL.length]);
    await expect(page.locator('[data-copy-status]')).toContainText(/Copy is blocked here\. Press (⌘C|Ctrl\+C)/);
    await expect(page.locator('[data-copy-hint]')).toHaveText(/Press (⌘C|Ctrl\+C)/);
    // Never claims success, and the mailto link still works.
    await expect(page.getByRole('button', { name: 'Email copied' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Send an email/ })).toHaveAttribute('href', `mailto:${EMAIL}`);
    // The button stays usable.
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(field).toBeFocused();
  });

  test('a clipboard promise that never settles does not leave a dead button', async ({ page }) => {
    await instrumentClipboard(page, 'hang');
    await page.goto(`${REAL}/contact`);
    await settle(page);
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.getByRole('button', { name: 'Email copied' })).toBeVisible({ timeout: 3000 });
  });
});

test.describe('copy code and article link @cross-browser', () => {
  test.beforeEach(async ({ context, browserName }) => grantClipboard(context, browserName));

  test('code blocks copy their code, not the button label', async ({ page, browserName }) => {
    await page.goto(`${FULL}/blog/fixture-long-article`);
    await settle(page);
    const pre = page.locator('.prose pre').first();
    const button = pre.locator('.code-copy');
    await expect(button).toHaveAccessibleName(/^Copy (\w+ )?code$/);
    const code = (await pre.locator('code').textContent()) ?? '';
    expect(code.length).toBeGreaterThan(0);
    await button.click();
    await expect(button).toHaveText('Copied');
    await expect(page.locator('[data-prose-status]')).toHaveText('Code copied to clipboard.');
    const clip = await readClipboard(page, browserName);
    if (clip !== null) expect(clip).toBe(code);
    await expect(button).toHaveText('Copy', { timeout: 4000 });
  });

  test('code copy falls back to selecting the code when the clipboard is blocked', async ({ page }) => {
    await instrumentClipboard(page, 'denied');
    await page.goto(`${FULL}/blog/fixture-long-article`);
    await settle(page);
    const pre = page.locator('.prose pre').first();
    const code = (await pre.locator('code').textContent()) ?? '';
    await pre.locator('.code-copy').click();
    await expect(pre.locator('.code-copy')).toHaveText(/Press (⌘C|Ctrl\+C)/);
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(code);
  });

  test('copy article link copies the live URL', async ({ page, browserName }) => {
    await page.goto(`${FULL}/blog/fixture-long-article`);
    await settle(page);
    const button = page.getByRole('button', { name: 'Copy article link' }).first();
    await button.click();
    await expect(page.getByRole('button', { name: 'Link copied' }).first()).toBeVisible();
    const clip = await readClipboard(page, browserName);
    if (clip !== null) expect(clip).toBe(`${FULL}/blog/fixture-long-article`);
  });
});
