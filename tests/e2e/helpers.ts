import { expect, type Page, type BrowserContext } from '@playwright/test';

export const REAL = 'http://localhost:4502';
export const FULL = 'http://localhost:4500';
export const SPARSE = 'http://localhost:4501';

export const REAL_PROJECTS = ['badminton-fairplay-queue', 'dragon-go', 'library-management-system', 'retail-sales-analysis'];
export const MOBILE = { width: 390, height: 844 };

/** Collects errors that belong to the website (not third-party frames or the deliberate 404 probe). */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  const ownOrigin = (url: string) => /^http:\/\/localhost:450\d/.test(url);
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = m.location().url;
    if (url && !ownOrigin(url)) return;
    if (/Failed to load resource/.test(m.text())) return; // reported below with the URL
    errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && ownOrigin(r.url()) && !/does-not-exist/.test(r.url())) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

/** Clicks after the cross-document view transition has finished, like a person would. */
export async function settle(page: Page) {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => !document.documentElement.matches(':active-view-transition'), null, { timeout: 2000 }).catch(() => {});
  await page.waitForTimeout(350);
}

export async function grantClipboard(context: BrowserContext, browserName: string) {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
}

export async function readClipboard(page: Page, browserName: string): Promise<string | null> {
  if (browserName !== 'chromium') return null; // WebKit has no clipboard-read permission in automation
  return page.evaluate(() => navigator.clipboard.readText());
}

export async function expectNoHorizontalOverflow(page: Page, label: string) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, `${label}: page scrollWidth ${sw} > viewport ${iw}`).toBeLessThanOrEqual(iw);
}
