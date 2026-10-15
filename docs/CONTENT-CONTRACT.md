# Content contract

This is the implementation contract for the next UI and integration steps. Public copy remains English. Do not add claims, metrics, dates, credentials, or links until the owner supplies them.

## Profile configuration

`src/config/site.ts` owns profile data.

- `education`, `workExperience`, and `leadership` are separate `TimelineEntry[]` groups.
- A timeline entry supports `title`, `organization`, optional `location`, `period`, `description`, `contributions[]`, `technologies[]`, `evidenceLinks[]`, and required numeric `order`.
- `resume` is `null` until an approved PDF exists. A configured record has `path`, optional `label`, and optional `updatedAt`.
- `portrait` is `null` until a real image and truthful alt text exist. A configured record has `src`, `alt`, `width`, and `height`.
- `availability` is `null` by default and makes no availability claim. It can later contain optional `seeking`, `roles[]`, `startDate`, and `note`.

UI defaults: no resume means no download link; no portrait means the monogram; no availability record means no availability section.

## Certificates

`src/config/portfolio.ts` owns `Certificate[]`. Fields are `title`, optional `issuer`, `issuedAt`, `credentialId`, `verificationUrl`, optional `asset` (`image` or `pdf` plus local `src` and optional `alt`), and required `order`.

Do not render Verify unless `verificationUrl` exists. Do not treat an uploaded asset as issuer verification.

## Projects

Each public project is `src/content/projects/<slug>.md`; the file name is the route slug. Files beginning with `_` are ignored templates.

Required fields: `title`, `role`, `tagline`, `summary`, non-empty `technologies`, `cover`, `coverAlt`, and `purpose`.

Existing fields remain supported: `featured`, `order`, `draft`, `earlier`, `demoUrl`, `repoUrl`, `period`, `teamSize`, `status`, `outcomes`, `gallery`, `coverImage`, `coverFit`, and `coverFrame`.

New optional fields:

- `category`: display/filter label.
- `demoStatus`: factual access or demo-state note.
- `media[]`: image or video records. Video `src` can be HTTPS or an existing public asset; `title` is required and `poster` is optional.
- `results[]`: a validated table (`columns` and equal-width `rows`) or an evidence image.
- `challenges[]` and `lessonsLearned[]`: verified statements only.
- `resources[]`: labelled documentation, notebook, dataset, report, or other links.
- `analysis`: `question`, `dataSources`, `methods`, `findings`, `charts`, and `limitations` for data projects.

Absent arrays default to `[]`. Empty media, result, challenge, lesson, and resource sections are not rendered. Use `_template-new-project.md` for general work and `_template-data-analysis.md` for analysis case studies. Both are private templates.

## Blog publication pipeline

Blog frontmatter supports required `title`, `description`, and `publishedAt`; `tags` defaults to `[]`; `updatedAt`, `cover`, and `draft` are optional/defaulted. `readingTime()` calculates reading time from Markdown body text at about 220 words per minute.

`getPublishedPosts()` in `src/utils/content.ts` is the only public source. It excludes `draft: true`, posts whose `publishedAt` is later than the current build/request time, and `_` templates that the loader never reads.

Home, blog listing, detail routes, related posts, RSS, sitemap-generated detail routes, and OG routes all start from this source. Search/filter UI must call `filterPublishedPosts()`; related content uses `getRelatedPosts()` with the already-published list.

## Asset and link rules

Local paths are site-root paths backed by `public/`, for example `/projects/my-app/chart.png`. Missing optional fields are valid. Once configured, a missing file fails check/build with the source field and resolved file path.

Use HTTPS URLs for external resources. Never use `#` or a made-up URL. Images require truthful `alt`, positive intrinsic `width`, and positive intrinsic `height`. Resume files belong in `public/resume/`, portraits in `public/about/`, certificates in `public/certificates/`, project media in `public/projects/<slug>/`, and blog covers in `public/blog/<slug>/`.

Markdown body images are not schema-validated. At build time, `src/utils/markdown-image-size.ts` adds intrinsic `width`/`height` (read from the file in `public/`), `loading="lazy"`, and `decoding="async"`. `npm run test:build` fails if any built page references a local image, video, or poster that does not exist. Promote key evidence into validated frontmatter when it matters.

## Validation behavior

- Shared schemas: `src/schemas/content.ts`; collection wiring: `src/content.config.ts`.
- Configured local assets: `src/utils/validation.ts`.
- Public project and blog slugs are checked case-insensitively for duplicates, including slugs set with a frontmatter `slug:` (which would otherwise silently replace another entry).
- Every `skillGroups.projectSlug` must resolve to a published project.
- Internal `evidenceLinks` in `education`, `workExperience`, and `leadership` must resolve:
  - `/projects/<slug>` to a published project;
  - `/blog/<slug>` to a published post;
  - other local paths to a file in `public/`.

  The main routes (`/`, `/about`, `/portfolio`, `/projects`, `/blog`, `/contact`) are always valid. Making a referenced project a draft therefore fails the build until the reference is removed.
- `updatedAt` cannot precede `publishedAt`.
- Result-table row widths must match their columns. Cells may be YAML strings, numbers, booleans, dates, or `null`; they render as text (`2026-01-02`, `31`, `NULL`), so pasted SQL output does not need quoting.
- `npm run validate:content` exercises minimal content, draft/future privacy, a complete private record, and a deliberate bad asset.

Run `npm run validate:content`, `npm run check`, and `npm run build` after content changes, and `npm test` before publishing. `npm test` runs unit, build-artifact, and Playwright e2e tests; `tests/build/build-artifacts.test.mjs` also proves that invalid content fails the build. See `docs/QA-REPORT.md`.

## How the UI consumes the contract

Every module renders only from configured data; nothing shows a placeholder, "Coming soon", or `#` link.

| Data | Where it appears | When absent |
| --- | --- | --- |
| `site.resume` | Home hero, Home portfolio preview, Portfolio header, Portfolio "current resume" block (View + Download) | No resume button anywhere; Portfolio offers Contact instead |
| `site.portrait` | Home hero (image only) and About (image) | Home shows nothing; About shows the monogram |
| `site.availability` | Home hero, About, Portfolio header | No availability line |
| `education` / `workExperience` / `leadership` | Portfolio sections and About timeline groups; `contributions`, `technologies`, `evidenceLinks` render on each card | Empty group is hidden |
| `certificates` | Portfolio grid. Image asset opens in the lightbox; PDF asset shows "View certificate"; `verificationUrl` shows "Verify Credential" | Section hidden |
| project `featured` | Home "Selected work"; heading counts them ("Four featured projects") | First two projects by `order` |
| project `category`, `technologies` | Facets on `/projects` (shown only with 2+ distinct values) | Facet hidden |
| project `demoStatus` | "Demo note" box under the case-study actions | Hidden |
| project `media` | "Demo" section. YouTube (`watch?v=`, `youtu.be`, `/shorts/`, `/embed/`) and Vimeo URLs embed (YouTube via `youtube-nocookie.com`); local files or `.mp4/.webm/.mov/.m4v/.ogv` URLs use `<video>`; any other HTTPS URL becomes a "Watch video" link card. A "Watch demo video" button appears in the header when a video exists | Section hidden |
| project `results` | "Results": tables scroll inside their own focusable region with a caption; images open in the lightbox | Hidden |
| project `analysis`, `outcomes`, `challenges`, `lessonsLearned`, `gallery`, `resources` | Their own sections, listed in the case-study table of contents | Hidden |

Blog and project details:

- A table of contents appears when an article reads in 3+ minutes and has at least 3 `##`/`###` headings, or a case study has at least 3 sections. Desktop shows a sticky sidebar; below 960 px it is a collapsible block ("On this page" / "In this case study").
- Filters are progressive enhancement: without JavaScript every item is listed. State lives in the URL, so links like `/projects?q=sql&category=Database+%26+SQL&tech=PostgreSQL` and `/blog?tag=sql` work and can be shared. Article tags link to `/blog?tag=<tag>`.
- In production builds `getPublishedPosts()` computes its publish cutoff once per build, so the list, detail routes, RSS, sitemap, OG images, and the RSS `<link>` in `<head>` always agree. The RSS `<link>` is emitted only when at least one post is published.

Script conventions for new interactive components:

- Bind document-level listeners once with `bindOnce()` and per-page setup with `onPageReady()` from `src/scripts/lifecycle.ts`. Setup must be idempotent and may return a cleanup function; it runs on first load, after cross-document view transitions, and on back/forward cache restores.
- Use `copyText()` from `src/scripts/clipboard.ts` for clipboard writes. It times out a stalled Clipboard API call and falls back, and returns `false` so callers can show a manual-copy path. Never report success when it returns `false`.
- Keep the `@view-transition { navigation: auto; }` opt-in inline in `BaseLayout`'s `<head>`. In Chromium, an opt-in that exists only in the external stylesheet is ignored once the page loads external module scripts: every navigation then skips its transition and logs an uncaught error.
- Use `ExternalLink.astro` for links that may be external or a local file: it adds `target="_blank"`, `rel="noopener noreferrer"`, and a visually hidden "(opens in a new tab)".
