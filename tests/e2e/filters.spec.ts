import { expect, test, type Page } from '@playwright/test';
import { FULL, REAL, settle } from './helpers';

const items = (page: Page, scope: string) => page.locator(`[data-filter-item="${scope}"]`);
const visibleItems = (page: Page, scope: string) => page.locator(`[data-filter-item="${scope}"]:not([hidden])`);
const count = (page: Page) => page.locator('[data-filter-count]');
const chip = (page: Page, facet: string, value: string) =>
  page.getByRole('group', { name: facet }).locator('label.chip', { has: page.getByText(value, { exact: true }) });

async function visibleTitles(page: Page, scope: string) {
  return visibleItems(page, scope).evaluateAll((els) => els.map((el) => el.querySelector('h2, h3, .earlier__name')?.textContent?.trim()));
}

test.describe('project filters', () => {
  test('search, combined facets, count, empty state, and both reset buttons', async ({ page }) => {
    await page.goto(`${REAL}/projects`);
    await settle(page);
    const total = await items(page, 'projects').count();
    expect(total).toBe(4);
    await expect(count(page)).toHaveText('Showing all 4 projects');

    const search = page.getByRole('searchbox', { name: 'Search projects' });
    await search.fill('dragon');
    await expect(visibleItems(page, 'projects')).toHaveCount(1);
    await expect(count(page)).toHaveText('Showing 1 of 4 projects');
    expect(await visibleTitles(page, 'projects')).toEqual(['DragonGo']);
    await expect(page).toHaveURL(`${REAL}/projects?q=dragon`);

    // Search by technology text is case- and accent-insensitive.
    await search.fill('POSTGRESQL');
    await expect(visibleItems(page, 'projects')).toHaveCount(3);

    await search.fill('');
    await chip(page, 'Category', 'Web app').click();
    await expect(visibleItems(page, 'projects')).toHaveCount(2);
    await chip(page, 'Technology', 'PostgreSQL').click();
    await expect(visibleItems(page, 'projects')).toHaveCount(1);
    expect(await visibleTitles(page, 'projects')).toEqual(['Badminton FairPlay Queue']);
    await expect(count(page)).toHaveText('Showing 1 of 4 projects');
    await expect(page).toHaveURL(/category=Web\+app/);
    await expect(page).toHaveURL(/tech=PostgreSQL/);

    await search.fill('library');
    await expect(visibleItems(page, 'projects')).toHaveCount(0);
    await expect(count(page)).toHaveText('No projects match these filters');
    const empty = page.locator('[data-filter-empty="projects"]');
    await expect(empty).toBeVisible();
    // Groups with nothing visible are hidden so no orphan headings remain.
    for (const group of await page.locator('[data-filter-group="projects"]').all()) await expect(group).toBeHidden();

    await empty.getByRole('button', { name: 'Reset filters' }).click();
    await expect(visibleItems(page, 'projects')).toHaveCount(4);
    await expect(count(page)).toHaveText('Showing all 4 projects');
    await expect(empty).toBeHidden();
    await expect(search).toBeFocused();
    await expect(search).toHaveValue('');
    await expect(page).toHaveURL(`${REAL}/projects`);

    await chip(page, 'Category', 'Database & SQL').click();
    await expect(visibleItems(page, 'projects')).toHaveCount(2);
    await page.getByRole('search').getByRole('button', { name: 'Reset filters' }).click();
    await expect(visibleItems(page, 'projects')).toHaveCount(4);
    await expect(page).toHaveURL(`${REAL}/projects`);

    await search.fill('queue');
    await search.press('Escape');
    await expect(search).toHaveValue('');
    await expect(visibleItems(page, 'projects')).toHaveCount(4);
  });

  test('state restores from the URL and survives visiting a project and going back', async ({ page }) => {
    await page.goto(`${REAL}/projects?category=Web%20app&tech=PostgreSQL`);
    await settle(page);
    await expect(visibleItems(page, 'projects')).toHaveCount(1);
    await expect(chip(page, 'Category', 'Web app').locator('input')).toBeChecked();
    await expect(chip(page, 'Technology', 'PostgreSQL').locator('input')).toBeChecked();

    await page.locator('main a[href="/projects/badminton-fairplay-queue"]:not([aria-hidden="true"])').first().click();
    await expect(page).toHaveURL(`${REAL}/projects/badminton-fairplay-queue`);
    await settle(page);
    await page.goBack();
    await settle(page);
    await expect(visibleItems(page, 'projects')).toHaveCount(1);
    await expect(count(page)).toHaveText('Showing 1 of 4 projects');

    await page.goto(`${REAL}/projects?category=does-not-exist`);
    await expect(visibleItems(page, 'projects'), 'unknown facet values fall back to All').toHaveCount(4);
  });

  test('without JavaScript every project is listed and the filter form stays hidden', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${REAL}/projects?q=dragon`);
    await expect(page.getByRole('search')).toBeHidden();
    await expect(page.locator('[data-filter-item="projects"]:visible')).toHaveCount(4);
    await context.close();
  });

  test('draft-only facet values never appear', async ({ page }) => {
    await page.goto(`${FULL}/projects`);
    await expect(page.getByRole('search')).toBeVisible();
    await expect(page.getByRole('search')).not.toContainText(/Fixture draft/i);
    await expect(count(page)).toHaveText('Showing all 5 projects');
  });
});

test.describe('blog filters', () => {
  test('tag + search combine, count matches, empty state resets, tag links preselect', async ({ page }) => {
    await page.goto(`${FULL}/blog`);
    await settle(page);
    await expect(count(page)).toHaveText('Showing all 2 articles');
    await chip(page, 'Tags', 'learning').click();
    await expect(visibleItems(page, 'posts')).toHaveCount(1);
    await expect(count(page)).toHaveText('Showing 1 of 2 articles');

    const search = page.getByRole('searchbox');
    await search.fill('every feature');
    await expect(visibleItems(page, 'posts')).toHaveCount(0);
    await expect(page.locator('[data-filter-empty="posts"]')).toBeVisible();
    await page.locator('[data-filter-empty="posts"]').getByRole('button', { name: 'Reset filters' }).click();
    await expect(visibleItems(page, 'posts')).toHaveCount(2);

    await search.fill('every feature');
    await expect(visibleItems(page, 'posts')).toHaveCount(1);

    await page.goto(`${FULL}/blog/fixture-long-article`);
    await settle(page);
    await page.locator('main a[href="/blog?tag=databases"]').first().click();
    await expect(page).toHaveURL(`${FULL}/blog?tag=databases`);
    await expect(visibleItems(page, 'posts')).toHaveCount(1);
    await expect(chip(page, 'Tags', 'databases').locator('input')).toBeChecked();
  });
});
