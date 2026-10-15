# QA report (step 3: QA and local finalization)

Date: Oct 15, 2026. Scope: the local working tree of the ianhuynh.me Astro site, after FOUNDATION_READY (step 1) and UI_READY (step 2).

**Not deployed.** Nothing was pushed or deployed and no email was sent. The real Badminton app and Supabase were not touched; the only contact with them was a single anonymous `GET` of the public demo URL during the link check. Fixture content was built only in temporary folders and never in `dist/`.

Every result below comes from tests re-run in this step. None is copied from earlier handoffs. The step-2 "94/94 browser checks" were not trusted: the new suite found five browser bugs that the earlier script had missed (one in Chromium/Chrome, four in Safari).

## Test layers added

| Layer | Command | What it proves |
| --- | --- | --- |
| Unit | `npm run test:unit` | 26 tests (Node test runner). Schema minimal/full records, empty arrays, required fields, rejected `#`, `javascript:` and `mailto:` demo URLs, asset and size rules, table width, draft/future publication, filters and format helpers, duplicate ids and frontmatter slugs, project references, internal evidence links, and the image-size reader checked against real PNG, JPEG, GIF, WebP and SVG files. |
| Build artifacts | `npm run test:build` | 23 tests. It builds the real content, a **full** fixture (every optional field) and a **sparse** fixture (every optional module empty) in isolated temp copies, then inspects the HTML, XML and PNG output. Twelve deliberately invalid content scenarios must each fail the build with a clear message. |
| Browser e2e | `npm run test:e2e` | 62 Playwright tests: 45 in Chromium and 17 `@cross-browser` tests in WebKit. They run against the three builds served with clean URLs on ports 4500, 4501 and 4502. |
| External links | `npm run test:links` | Fetches every external link in `dist/` with `GET` and separates broken links from sites that block bots and from network failures. |
| Content contract | `npm run validate:content` | The step-1 schema and publication fixtures. |

`npm test` runs `validate:content`, `test:unit`, `test:build` and `test:e2e`.

## Flow matrix

PASS means an automated test covers the flow and passed in the final run. NOT TESTED means it was not exercised; the reason is given.

### Build and content

| Flow | Result | Evidence |
| --- | --- | --- |
| `npm run check` / `npm run build` with no CV, portrait, video, certificate files, or blog posts | PASS | Real build: 11 pages, no RSS, empty-blog state links to `/projects` |
| Minimal record, full record, empty arrays, optional fields | PASS | Unit schema tests; full and sparse fixture builds |
| Duplicate slug (file name or frontmatter `slug:`) | PASS (fails build) | **Bug 1** fixed |
| Wrong project reference (skill group, evidence link, project switched to draft) | PASS (fails build) | **Bug 2** fixed |
| Wrong local asset (image, resume, non-PDF resume, portrait, certificate, video) | PASS (fails build) | Invalid-scenario tests |
| `#` demo/evidence link, table row width mismatch | PASS (fails build) | Invalid-scenario tests |
| Added content appears without component changes | PASS | Full fixture adds a project, 2 posts, resume, portrait, availability, experience, leadership, 3 certificates, video, results, gallery. All rendered with no code change |
| Drafts, `_` templates, future posts excluded from list, detail route, search/filter facets, related, RSS, sitemap, OG | PASS | Privacy audit over every output file; draft-only facet values absent; detail URLs return 404 |
| RSS only when a post exists; `<link rel="alternate">` matches | PASS | Real: no feed. Full: exactly 2 items |
| Sitemap equals indexable pages; robots; 404 page | PASS | Build-artifact invariants |
| Metadata: one `h1`, title, description, `lang`, canonical = og:url = origin + route, OG image exists, no canonical on noindex 404 | PASS | **Bug 3** fixed (404 declared a canonical) |
| Images have alt + width/height; local `src`/`poster` exist | PASS | **Bug 4** fixed (Markdown and certificate images had no size) |
| Internal links resolve; no `#`, empty, `javascript:` or `http://` links; `_blank` has `noopener` | PASS | Every page of all three builds |
| URLs unchanged (`/`, `/about`, `/portfolio`, `/projects`, 4 case studies, `/blog`, `/contact`, sitemap, robots, favicon) | PASS | `journey.spec.ts` |

### Browser behaviour (e2e)

| Flow | Chromium | WebKit | Evidence |
| --- | --- | --- | --- |
| Journey Home → Projects → each case study → About → Portfolio → Blog → Contact by clicking; `aria-current` | PASS | PASS | `journey.spec.ts` |
| No website console errors, page errors or failed requests on every page of all 3 builds | PASS | NOT TESTED | Chromium only. **Bug 5** fixed: every navigation had logged a transition error |
| Copy email after arriving from 6 pages via the nav | PASS | PASS | `copy.spec.ts`; clipboard content checked in Chromium |
| Copy email after arriving via the mobile menu | PASS | PASS | |
| Copy after back/forward × 3 and reload; feedback resets; exactly one clipboard write per click | PASS | PASS | |
| Clipboard denied → selected manual-copy field, instructions, no false "copied" | PASS | PASS | |
| Clipboard promise that never settles → no dead button | PASS | PASS | |
| Copy code (copies code only); blocked → code selected + instructions | PASS | PASS | |
| Copy article link (live URL) | PASS | PASS | |
| Mobile menu: button, Escape, backdrop, close, current-page link | PASS | PASS | **Bug 6** (menu clipped in Safari) and **Bug 7** (focus not returned) fixed |
| Mobile menu keyboard: Enter opens, focus starts inside, Tab/Shift+Tab trapped | PASS | PASS | **Bug 8** fixed (Tab escaped in Safari) |
| No duplicate listeners after 6 menu navigations + history | PASS | PASS | |
| Menu closes on resize to desktop | PASS | PASS | |
| Project search, combined category + tech filters, counts, empty state, both resets, Escape clears | PASS | NOT TESTED | `filters.spec.ts` (Chromium only) |
| Filter state from URL, kept after visiting a project and going back; unknown value → All | PASS | NOT TESTED | |
| Blog tag + search, empty state, tag links preselect the filter | PASS | NOT TESTED | Full fixture |
| No-JS: full lists, filter form hidden | PASS | NOT TESTED | |
| Lightbox: click/keyboard open, next/prev buttons, arrow keys, wrap, close button/Escape/backdrop, focus returns, image loads with alt | PASS | PASS | `lightbox.spec.ts` |
| Single image (no prev/next); certificate image; no-JS opens file | PASS | PASS | |
| CV present: Download has `download` attribute, PDF returns 200 `application/pdf` starting `%PDF-`, View opens in new tab | PASS | PASS | Download event checked in Chromium |
| CV absent: no resume link or `.pdf` link anywhere | PASS | NOT TESTED | Real and sparse builds |
| Sparse fallbacks: no email block, experience, leadership, certificates, portrait, or availability; Contact CTA shown | PASS | NOT TESTED | `states.spec.ts` |
| Empty blog state; published-only list; draft/future/template URLs 404 | PASS | NOT TESTED | |
| Video embed (title, lazy) and case-study TOC | PASS | NOT TESTED | |

### Responsive, accessibility, performance

| Flow | Result | Evidence |
| --- | --- | --- |
| 360 / 390 / 768 / 1440 px, 18 pages across 3 builds: no page-level horizontal overflow, no overlapping links/buttons/inputs | PASS | `responsive.spec.ts`; 72 full-page screenshots |
| Code blocks and result tables scroll inside their own focusable region at 360 px | PASS | Long article + case study |
| Images load with alt and dimensions | PASS | 5 image-heavy pages |
| axe-core, WCAG 2.0/2.1/2.2 A+AA rules, 21 pages (real, full, sparse) at desktop and mobile | PASS (0 violations) | `a11y.spec.ts`, run with reduced motion so content is fully shown |
| Visible focus on every Tab stop (3 pages, up to 40 stops each) | PASS | |
| Skip link visible on focus and moves focus to `main` | PASS | |
| Reduced motion: reveal content visible immediately, no transitions | PASS | |
| Reveal script failure (IntersectionObserver throws): content visible within ~3.5 s via the CSS fallback | PASS | |
| No-JS: all reveal content visible; mailto works; mobile footer links every section | PASS | |
| Lighthouse 12.8.2, mobile, local static server | MEASURED | Home: Performance 98, Accessibility 96, Best Practices 100, SEO 100 (FCP 1.7 s, LCP 2.0 s, TBT 0 ms, CLS 0). Badminton case study: 96 / 100 / 100 / 100 (FCP 2.0 s, LCP 2.5 s, TBT 0 ms, CLS 0.001). See notes below |
| External links | PASS | 9 links. 7 OK. LinkedIn (999) and Facebook (400) refuse automated requests; open them manually. 0 broken |
| Real Core Web Vitals (field data), production host | NOT TESTED | Site not deployed; lab numbers only |
| Firefox, real iOS/Android devices | NOT TESTED | WebKit engine covers Safari behaviour but is not a device test |
| Screen readers (VoiceOver, NVDA) by hand | NOT TESTED | axe and accessible-name checks only |

Notes on the Lighthouse run:

- **Accessibility 96 on Home.** Lighthouse flagged color contrast on the project cards. The reported color (`#4e524e`) is the muted text mid-way through the scroll-reveal fade. Re-checking with axe at 412 and 1440 px after the reveal finishes gives 0 violations, so this is a timing artifact, not a real contrast problem.
- **Remaining "opportunities".** Some come from the local test server, which has no compression or caching headers; Vercel provides both. Others are known limits:
  - screenshots are PNGs without `srcset`;
  - the font and global CSS block rendering.

## Bugs found and fixed in this step

Each bug was reproduced first, then fixed, then covered by a regression test that now passes.

1. **A duplicate slug silently replaced a project.** A frontmatter `slug:` equal to an existing project overwrote it, and the build only warned.
   - Fix: `src/utils/validation.ts` (`validateContentSourceSlugs` reads frontmatter slugs). The build now fails.
2. **Broken internal evidence links built successfully.** `evidenceLinks` pointing to an unknown or draft project, a post, or a missing file still built.
   - Fix: `assertInternalLink` in `src/utils/validation.ts`, called from `src/utils/content.ts`. The build now fails with the field path.
3. **The 404 page declared a canonical URL and og:url while marked `noindex`.**
   - Fix: `src/components/Seo.astro`.
4. **Markdown body images and certificate thumbnails had no width/height** (layout shift).
   - Fix: a new `src/utils/image-size.ts` reads the real pixel size from `public/` files (PNG, JPEG, GIF, WebP, SVG).
   - `src/utils/markdown-image-size.ts` is a Sätteri hast plugin, wired in `astro.config.mjs`; it also adds `loading="lazy"` and `decoding="async"`.
   - `src/components/CertificateCard.astro` uses the same reader.
5. **Chromium and Google Chrome skipped every page transition and logged an uncaught error** on each navigation: "Transition was aborted/skipped… ViewTransition opt-in disabled".
   - Cause: the regression came from step 2. Pages started loading shared external module scripts while the `@view-transition` opt-in lived only in the external stylesheet.
   - Reproduced: in a two-file minimal page, and in the installed Google Chrome.
   - Fix: the opt-in is now inline in `<head>` (`src/layouts/BaseLayout.astro`) and was removed from `global.css`. A build test keeps it inline.
6. **Safari/iOS: the open mobile menu was clipped to the 71 px header.** The navigation links were unreachable on iPhone.
   - Cause: `backdrop-filter` on the sticky header made it the containing block for the fixed menu.
   - This bug was already in the committed `HEAD`, so the live site is likely affected.
   - Fix: the blur moved to `.site-header::before` (`src/components/Header.astro`). The test asserts the panel fills the viewport.
7. **Safari: focus was not returned to the menu button after Escape or Close.** Safari does not focus a button when it is clicked.
   - Fix: focus now always returns to the trigger.
8. **Safari: Tab could leave the open modal menu.** Safari's default Tab order skips links.
   - Fix: the menu moves focus explicitly between its links and buttons.

Test-side corrections, which were not site bugs:
- the real build has 3 featured projects, not 4;
- the card cover is a decorative duplicate link;
- chip labels contain whitespace;
- the blog facet is called "Tags";
- the reduced-motion reset uses `0.01ms`;
- inline links that wrap span two lines.

Other changes in this step:
- the superseded `scripts/ui-fixture/browser-qa.mjs` was removed;
- `docs/HANDOFF-CURSOR.md` now points here;
- `CONTENT-CHECKLIST.md` was rewritten;
- `docs/CONTENT-CONTRACT.md` and `README.md` were updated.

## Commands and final results

Run after the last code change, on Oct 15, 2026.

| Command | Result |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, 3 hints. All three hints are the deprecated `document.execCommand`: the deliberate copy fallback in `src/scripts/clipboard.ts`, and the test that stubs it |
| `npm run build` | 11 pages built. Expected warning: the `blog` collection is empty |
| `npm run validate:content` | Passed (minimal, private draft/future, complete record, broken asset) |
| `npm run test:unit` | 26 / 26 passed |
| `npm run test:build` | 23 / 23 passed (real, full and sparse builds; 12 invalid-content scenarios fail as intended; privacy audit passed) |
| `npm run test:e2e` | 62 / 62 passed (45 Chromium + 17 WebKit), about 1.1 min |
| `npm run test:links` | 9 external links: 7 OK, 2 blocked by the site (LinkedIn 999, Facebook 400), 0 network failures, 0 broken |
| Lighthouse 12.8.2 (`npx lighthouse`, mobile, local) | See the table above. This is a one-off measurement, not part of `npm test` |

Prerequisite for e2e: `npx playwright install chromium webkit` (browsers are cached in `~/Library/Caches/ms-playwright`).

## Limits

- Only the Chromium and WebKit engines were tested, headless and emulated, on macOS. Firefox and physical phones were not tested.
- Clipboard read-back works only in Chromium. In WebKit the tests verify the visible and announced feedback and the write call, not the clipboard contents.
- Back/forward is exercised, but the tests don't assert whether the browser restored the page from bfcache. The restore code path (`pageshow.persisted`) is therefore covered only by its reset assertions.
- Some specs run only in Chromium: filters, sparse/blog states, the axe sweep, responsive screenshots, and the console-error sweep. The layout CSS is shared, so these are expected to behave the same in WebKit.
- Lighthouse numbers are lab measurements from a local Node server without compression or caching. They are not field Core Web Vitals.
- The external link check depends on the network at test time. Bot-blocked sites need a manual check in a browser.
- Real content gaps (no CV, portrait, availability, certificate details, Badminton video, SQL result data, or blog posts) are listed in `CONTENT-CHECKLIST.md`. They are tested only through fixtures.

## Artifacts

All are git-ignored and regenerated by the commands above.

| Artifact | Location |
| --- | --- |
| Playwright HTML report | `test-results/report/` (open with `npx playwright show-report test-results/report`) |
| Full-page screenshots, 18 pages × 4 widths | `test-results/screenshots/{360,390,768,1440}/*.png` |
| Traces and screenshots of failing tests (empty when all pass) | `test-results/e2e/` |
| Lighthouse JSON reports | `test-results/lighthouse/home.json`, `test-results/lighthouse/projects-badminton-fairplay-queue.json` |
| Fixture builds | `$TMPDIR/ian-ui-fixture-full/dist`, `$TMPDIR/ian-ui-fixture-sparse/dist` |
