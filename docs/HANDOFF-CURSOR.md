# Cursor UI handoff

Step 2 (UI and behaviour) on top of the Codex foundation in `docs/HANDOFF-CODEX.md`. Everything is local and uncommitted: nothing was pushed or deployed, and the external badminton app (repo, Supabase, club sessions) was not touched.

Status: **UI_READY** for testing.

## What works now

Every module renders from the existing config/Markdown and has a defined "missing data" state. No placeholder text, fake buttons, or `#` links are rendered anywhere. `docs/CONTENT-CONTRACT.md` → "How the UI consumes the contract" maps each field to where it appears.

- **Home**: featured work comes from `featured: true` with a counted heading ("Four featured projects"). CTAs are View Projects, Download Resume (only when `site.resume` exists), and Contact. Optional availability line and portrait slot. Person JSON-LD.
- **Header / footer / mobile menu**: `aria-current="page"` (project and blog detail pages mark their section), keyboard open, focus trap, Escape restores focus, scroll unlock, 44 px targets, works after every navigation and bfcache restore.
- **Portfolio / About**: separate Education, Work experience, and Leadership groups (empty groups hidden). Cards support contributions, technologies, and evidence links. Certificate cards show issuer, date, credential ID, an image (lightbox) or PDF, and Verify Credential only with a URL. The resume block offers View + Download, or Contact when there is no resume. About falls back to the monogram.
- **Projects**: search plus category and technology filters built from data. Includes result count (aria-live), reset, no-match state, and shareable URL state (`?q=&category=&tech=`). Without JS the full list shows and the form stays hidden.
- **Case studies**: role, category, stack, period, team, status, demo note, video (YouTube/Vimeo embed, `<video>`, or link card), "Watch demo video" jump link, analysis, results tables/images, outcomes, challenges, lessons, evidence gallery, and resources. Each renders only when present, and the TOC lists only rendered sections.
- **Lightbox**: grouped next/previous, arrow keys, Escape, close button, backdrop click, "Image X of N" announcement, focus returns to the opener.
- **Blog**: tag and text filter (`/blog?tag=`), optional cover thumbnail, reading time, a TOC (sidebar on desktop, collapsible on mobile) for 3+ minute articles with 3+ headings, related posts, tag links, code copy, and copy link. The empty state links to Projects. Drafts, future-dated posts, and `_` templates never reach the list, routes, related, RSS, sitemap, or OG images (verified by the fixture audit). The RSS `<link>` is emitted only when posts exist.
- **Contact**: the copy-email fix below. `mailto:` is unchanged, and nothing claims a message was "sent". Social links have accessible names and open in a new tab with `noopener noreferrer`.
- **Accessibility / resilience**: content is visible without JS and with reduced motion. A CSS safety net reveals content even if the reveal script never runs. Code blocks and tables scroll inside their own keyboard-focusable region. axe (WCAG 2.1 AA) is clean on every main page in both real and fixture builds.

## The Copy email bug

**Report:** go to Contact through the menu, click Copy email, nothing happens; after a reload it works.

**What I checked.** The site uses native cross-document view transitions (`@view-transition { navigation: auto }` in `global.css`), not Astro's `<ClientRouter>`, so every navigation is a full page load. The old `CopyButton.astro` bound a click listener per element when the script ran, and only gave feedback after `navigator.clipboard.writeText()` settled.

**Reproduction attempts.** I could not reproduce a persistent failure in automation. I tried the pre-change build, the dev server, and the live site, in headless and headed Chromium and in WebKit, via desktop nav, the mobile menu, back/forward, and bfcache. Measured findings:

- For about 250 ms after a menu navigation, the view-transition overlay takes hit-testing, and clicks land on `<html>` instead of the button. That is the 200 ms route cross-fade. It explains a lost click only if someone clicks immediately; it does not explain the button staying dead.
- If the Clipboard API rejects, the old code showed the fallback input. If the promise **never settles** (seen in some embedded and unfocused-document situations), the old code gave no feedback at all. That matches "nothing happens" and is the most likely cause, but I could not confirm it in your browser.

**Fix (covers every mechanism above):**

- `src/scripts/clipboard.ts` (`copyText`) races the Clipboard API against a 1.5 s timeout, then tries `execCommand('copy')`, and returns `false` instead of hanging.
- `CopyButton.astro` uses one delegated document listener bound once (`bindOnce`), so it works regardless of when the script runs or how the page was entered. Success shows "Copied" plus an aria-live announcement. Failure reveals a selected, read-only input with "Press ⌘C / Ctrl+C". State resets on bfcache restore.
- The same pattern applies to code-block copy and copy-article-link (`src/scripts/prose-enhance.ts`). The menu, reveal, TOC, filters, and lightbox use `onPageReady` (idempotent, with cleanup) from `src/scripts/lifecycle.ts`.

**Verify manually:**

1. `npm run build && npm run preview`.
2. In Chrome/Arc and Safari at phone width, open the menu, go to Contact, wait for the page to settle, and click **Copy email**. The button should read "Copied" and the email should paste.
3. Repeat via the desktop nav; via Back then Forward; and via Contact → About → Back.
4. Denied clipboard: in DevTools run `navigator.clipboard.writeText = () => Promise.reject(new Error('x')); document.execCommand = () => false` and click again. The email input appears selected with a ⌘C/Ctrl+C hint, and the button does not claim success.

The automated suite below covers these steps in Chromium and WebKit, plus a never-settling clipboard promise and a "one click = one write" check for duplicate listeners.

## Files

New:

- `src/scripts/lifecycle.ts`, `src/scripts/clipboard.ts`: page lifecycle and clipboard helpers.
- `src/components/ExternalLink.astro`, `Gallery.astro`, `VideoEmbed.astro`, `ResultBlock.astro`, `FilterBar.astro`, `ResumeActions.astro`, `Availability.astro`, `Portrait.astro`, `TimelineCard.astro`, `CertificateCard.astro`.
- `src/utils/filters.ts` (shared search/facet matching) and `src/utils/format.ts` (counts, plurals, list joins).
- `scripts/ui-fixture/`: private fixture builder, fixture content, static server, and browser QA script.
- `docs/HANDOFF-CURSOR.md`.

Changed:

- Pages: `index`, `about`, `portfolio`, `contact`, `projects/index`, `projects/[slug]`, `blog/index`.
- Layouts: `BaseLayout` (RSS link) and `ArticleLayout` (TOC variants, tag links, related heading, progress bar lifecycle).
- Components: `CopyButton`, `Header`, `Footer`, `Lightbox`, `TableOfContents`, `Icon`.
- Scripts and styles: `prose-enhance.ts`, `reveal.ts`, `global.css` (reveal fallback, filter/empty-state styles), `prose.css` (code focus ring).
- `src/utils/content.ts`: search text helpers, shared matchers, one publish cutoff per production build.
- `src/schemas/content.ts`: result-table cells accept YAML numbers, dates, booleans, and `null`.
- `astro.config.mjs`: Shiki puts the keyboard tab stop on the scrolling `<code>`.
- `package.json`: `fixture:ui` script.
- Content: added `category` to the four projects; Badminton is `featured: true` with a commented demo-video/`demoStatus` slot; Library has a commented `results` example marked "real query output only".
- Docs: `docs/CONTENT-CONTRACT.md` (UI section, result cells), `CONTENT-CHECKLIST.md`, `README.md`.

## Fixtures (private)

`npm run fixture:ui -- full` or `npm run fixture:ui -- sparse` copies the repo to `$TMPDIR/ian-ui-fixture-<mode>`, overlays fixture data, builds, and audits the output. The real `src/` is never modified, and fixture files under `scripts/ui-fixture/` are outside every content collection.

- **full** fills every optional field:
  - resume PDF, portrait, and availability;
  - two work-experience entries and a leadership entry with contributions, technologies, and evidence links;
  - three certificates (image + verify, PDF only, title only);
  - a case study with every project field;
  - two published posts, plus a draft, a 2099-dated post, and the template.
- **sparse** sets no email, resume, portrait, or availability, and empties work, leadership, certificates, and the blog.
- **Audit**: the build fails if any draft, future, or template slug or title appears in HTML, RSS, sitemap, or OG output, or if expected published output is missing.

## Commands and results (Oct 15, 2026)

| Command | Result |
| --- | --- |
| `npm run validate:content` | Passed (minimal, private draft/future, complete record, broken asset) |
| `npm run check` | 0 errors, 0 warnings, 1 hint (intentional `execCommand` fallback in `clipboard.ts`) |
| `npm run build` | 11 pages. Sitemap has the 10 public URLs; no RSS file or link while the blog is empty |
| `npm run fixture:ui -- full` | Built; privacy audit passed (78 files) |
| `npm run fixture:ui -- sparse` | Built; privacy audit passed (61 files) |
> **Superseded in the QA step.** The standalone `scripts/ui-fixture/browser-qa.mjs` (reported here as "94/94") was replaced by the committed suite run with `npm test`: unit, build-artifact, and Playwright e2e in Chromium and WebKit. That earlier script missed four bugs that were fixed afterwards: Chromium/Chrome skipping every page transition with a console error, and three Safari mobile-menu bugs (menu clipped to the header, Tab leaving the menu, focus not returning). Current, re-run results are in `docs/QA-REPORT.md`.

## For the owner to add later

The UI picks each item up automatically; see `CONTENT-CHECKLIST.md` for exact shapes.

1. **Resume PDF**: `public/resume/…pdf` + `site.resume`. This enables Download Resume on Home and Portfolio and the View + Download block.
2. **Portrait**: a real photo + truthful alt in `site.portrait`. Home hero and About.
3. **Availability**: `site.availability` (roles, start date, note), only once confirmed.
4. **TPCOMS**: `contributions`, `technologies`, `evidenceLinks` in `site.workExperience`. **Drexel VSA**: the same in `site.leadership`.
5. **Certificates**: issuer, `issuedAt`, `credentialId`, `verificationUrl`, and image/PDF for the two existing certificates.
6. **Badminton FairPlay Queue**: a real demo video under `media` (YouTube/Vimeo/local `.mp4` + poster), and `demoStatus` if the live demo needs a note while no club session is open. The commented slot is in the project file.
7. **Library Management System**: real query output as `results` (tables or screenshots). The commented example shows the shape.
8. **Blog**: the first real post (copy `_template-new-post.md`, set `draft: false`). RSS, the feed link, filters, and related posts switch on automatically.
9. **Domain decision**: `site.productionOrigin` is `https://ianhuynh.me`, but the live apex answers `308 → https://www.ianhuynh.me/`. Canonical, sitemap, and OG URLs therefore point at a redirect. Either make the apex the primary domain in Vercel, or change `productionOrigin` to the `www` origin. Not changed here because it is a deployment choice.

## Known limits

- The original copy failure was not reproduced in automation (see above); the fix covers every mechanism I could verify.
- Clicks in the first ~200 ms of a route cross-fade go to the transition overlay. This is browser behaviour of native view transitions, and it is disabled under reduced motion.
- Embedded YouTube/Vimeo players are third-party iframes and are excluded from axe.
