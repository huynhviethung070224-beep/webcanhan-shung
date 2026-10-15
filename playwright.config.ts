import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * E2E against static builds served with Vercel-style clean URLs:
 *   real   → ./dist (npm run build)                         http://localhost:4502
 *   full   → $TMPDIR/ian-ui-fixture-full/dist (fixture)     http://localhost:4500
 *   sparse → $TMPDIR/ian-ui-fixture-sparse/dist (fixture)   http://localhost:4501
 * `npm run test:e2e` builds all three first.
 */
const serve = (dir: string, port: number) => ({
  command: `node scripts/ui-fixture/serve.mjs "${dir}" ${port}`,
  url: `http://localhost:${port}/`,
  reuseExistingServer: !process.env.CI,
  stdout: 'ignore' as const,
});

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/e2e',
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'test-results/report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4502',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    // Copy/menu/navigation flows are repeated in WebKit (Safari engine).
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } }, grep: /@cross-browser/ },
  ],
  webServer: [
    serve('dist', 4502),
    serve(join(tmpdir(), 'ian-ui-fixture-full', 'dist'), 4500),
    serve(join(tmpdir(), 'ian-ui-fixture-sparse', 'dist'), 4501),
  ],
});
