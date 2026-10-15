# Codex foundation handoff

## What is ready

- Profile data is separated into Education, Work Experience, and Leadership / Activities.
- Resume, portrait, and availability are optional and currently make no unsupported claim.
- Certificates support issuer/date/credential/verification/evidence while retaining the two existing names.
- Projects support category, media/video, demo notes, result tables/images, challenges, lessons, resources/notebooks, and structured data-analysis content.
- Blog publication has one public retrieval path and excludes drafts, `_` templates, and scheduled posts.
- Configured local assets fail clearly when missing; absent optional assets remain valid.
- Private validation covers minimal content, no-public-content states, a complete record, and a bad path.

## Files changed and use

- `src/config/site.ts`: profile assets/availability and three timeline groups.
- `src/config/portfolio.ts`: certificate contract.
- `src/schemas/content.ts` + `src/content.config.ts`: project/blog validation.
- `src/utils/content.ts`, `publication.ts`, and `validation.ts`: publication and integrity helpers.
- `src/content/projects/_template-new-project.md` and `_template-data-analysis.md`: private authoring templates.
- `src/content/blog/_template-new-post.md`: private article template.
- `scripts/validate-content-foundation.ts` + `npm run validate:content`: private fixtures.
- About/Portfolio and blog/home/RSS/OG routes: compatibility changes only.
- `docs/CONTENT-CONTRACT.md` and `CONTENT-CHECKLIST.md`: schema and author instructions.

## Cursor scope

Build presentation and interactions for the new optional fields. Hide empty sections. Render certificate Verify only for `verificationUrl`; render media/results/resources only when non-empty; show `demoStatus` as text, not a fake link; and implement blog search/tag controls through `filterPublishedPosts()`.

The current case-study component still renders established `outcomes` and `gallery`. New project fields are data-ready but intentionally not visually designed in this step.

## Commands

```sh
npm run validate:content
npm run check
npm run build
```

Final local results on October 15, 2026:

- `npm run validate:content`: passed all four private fixture states.
- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm run build`: passed; 11 static pages built. The expected empty-blog loader warning remains because there are no real posts.
- Output audit: no template/fixture/blog-detail URL in `dist` or the sitemap; `/rss.xml` was not emitted while the blog is empty.
- `git diff --check`: passed.

No push or deployment was performed.
