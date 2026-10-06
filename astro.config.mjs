// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { resolveSiteOrigin } from './src/config/site.ts';

const siteOrigin = resolveSiteOrigin();

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: siteOrigin,
  output: 'static',
  trailingSlash: 'never',
  // Preserve HTML-aware whitespace between inline elements (Astro 7 defaults to JSX rules).
  compressHTML: true,
  integrations: [
    sitemap({
      // Drafts are never generated as routes, but keep editor/template URLs out regardless.
      filter: (page) => !page.includes('/_') && !page.includes('/404'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: false,
    },
  },
  build: {
    // `/about` -> `about.html` so direct loads work on static hosts without trailing slashes.
    format: 'file',
    inlineStylesheets: 'auto',
  },
});
