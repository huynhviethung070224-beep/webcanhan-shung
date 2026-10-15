# Content checklist

How to add real content to the site. Every module below is already built and tested with private fixtures; it stays hidden until you supply the content, so nothing shows "Coming soon", a placeholder, or a `#` link. Add only content you can stand behind: no invented metrics, dates, credentials, or links.

After any change, run the commands in [Check your changes](#check-your-changes). If the build fails, it names the file and field to fix. Do not remove validation to make it pass.

## What is still missing

| Content | Status today | Where it goes |
| --- | --- | --- |
| Resume PDF | Not added; no resume buttons anywhere | [Resume](#resume) |
| Portrait photo | Not added; About shows the monogram, Home shows no photo | [Portrait](#portrait) |
| Availability (roles, start date) | Not set; no availability line | [Availability](#availability) |
| TPCOMS contributions | Card shows title, organization, and period only | [Experience and leadership](#experience-education-and-leadership) |
| Certificate details (issuer, date, ID, verify link, file) | Two certificates are title-only | [Certificates](#certificates) |
| Badminton demo video or screenshots | Case study has no media section | [Projects](#projects) |
| Library SQL result tables or images | No results section | [Projects](#projects) |
| Blog posts | Blog shows a designed empty state; no RSS feed | [Blog](#blog) |

Already live: contact email (`site.contactEmail`), social links, four projects, education, TPCOMS, and Drexel VSA.

## Images and files: general rules

- Local files live in `public/`, and you refer to them with a path starting at the site root. For example, `public/projects/dragon-go/home.png` becomes `/projects/dragon-go/home.png`.
- Every configured image needs truthful `alt` text and its real pixel `width` and `height`. On macOS run `sips -g pixelWidth -g pixelHeight <file>` to get the size.
- If a configured file is missing, the build fails with the field name and the path it looked for.
- External links must be full `https://` URLs (`npm test` rejects `http://`). Internal links must point to a published page or an existing file.

## Resume

1. Put the approved PDF at `public/resume/huynh-viet-hung-resume.pdf`.
2. In `src/config/site.ts`, replace `resume: null as ResumeConfig | null` with:

   ```ts
   resume: {
     path: '/resume/huynh-viet-hung-resume.pdf',
     label: 'Download Resume', // optional
     updatedAt: 'October 2026', // optional, shown next to the resume block
   } as ResumeConfig | null,
   ```

The resume then appears in four places with no other changes:
- the Home hero (Download);
- the Home portfolio preview;
- the Portfolio header;
- a Portfolio "current resume" block with View (new tab) and Download.

The build fails if the file is missing or is not a PDF.

## Portrait

1. Put the photo in `public/about/`, for example `public/about/portrait.webp`. JPEG, PNG and WebP all work; WebP or a well-compressed JPEG of about 1200 px is enough.
2. In `src/config/site.ts`, replace `portrait: null as PortraitConfig | null` with:

   ```ts
   portrait: {
     src: '/about/portrait.webp',
     alt: 'Huynh Viet Hung (Ian) …', // describe the actual photo
     width: 1200,
     height: 1500,
   } as PortraitConfig | null,
   ```

The photo then appears in the Home hero and on About.

## Availability

Leave `availability: null` until the details are confirmed. When they are, use this shape (the example values are not real):

```ts
availability: {
  seeking: true,
  roles: ['Data Analyst Co-op'],
  startDate: 'Month Year',
  note: 'Optional short sentence.',
} as AvailabilityConfig | null,
```

It is shown in the Home hero, on About, and in the Portfolio header.

## Experience, education, and leadership

Edit the `education`, `workExperience`, or `leadership` array in `src/config/site.ts`. Each entry:

```ts
{
  title: 'Role or degree',
  organization: 'Organization',
  location: 'City, State',                 // optional
  period: 'Month Year – Month Year',       // optional
  description: 'One approved sentence.',   // optional
  contributions: ['What you did.'],        // optional, shown as bullets
  technologies: ['SQL', 'Python'],         // optional, shown as chips
  evidenceLinks: [                         // optional
    { label: 'Library case study', url: '/projects/library-management-system' },
    { label: 'Report', url: 'https://…' },
  ],
  order: 1,                                // lower comes first
}
```

These entries feed the Portfolio sections ("Where I'm studying", "Professional experience", "Community involvement") and the About timeline. A group with no entries is hidden.

Evidence links are checked at build time:
- `/projects/<slug>` must be a published project;
- `/blog/<slug>` must be a published post;
- other local paths must be existing files in `public/`;
- the main pages (`/`, `/about`, …) are always accepted.

For TPCOMS, add `contributions` (and optionally `technologies`) to the existing entry once the details are approved.

## Certificates

Edit `certificates` in `src/config/portfolio.ts`. The two current entries are title-only. Add the details you have:

```ts
{
  title: 'Databases and SQL for Data Science',
  issuer: 'Issuer name',                                        // optional
  issuedAt: 'Month Year',                                       // optional
  credentialId: 'ID from the issuer',                           // optional
  verificationUrl: 'https://…',                                 // optional; shows "Verify Credential"
  asset: { type: 'pdf', src: '/certificates/sql-for-ds.pdf' },  // optional; or type 'image' with alt
  order: 1,
}
```

- Put the files in `public/certificates/`.
- An image asset shows a thumbnail that opens in the image viewer.
- A PDF asset shows a "View certificate" button.
- With no certificates at all, the Credentials section is hidden.

## Projects

Templates (files starting with `_` are never published):
- `src/content/projects/_template-new-project.md` for apps and general projects;
- `src/content/projects/_template-data-analysis.md` for analysis or SQL case studies, with the `analysis` block (question, data sources, methods, findings, charts, limitations).

Steps:
1. Copy a template to `src/content/projects/<slug>.md`. The file name becomes the URL (`my-app.md` becomes `/projects/my-app`). Never reuse an existing slug, either as a file name or via a frontmatter `slug:`; a duplicate fails the build.
2. Fill the required fields: `title`, `role`, `tagline`, `summary`, `technologies`, `cover` (`orbit` or `schema` illustration), `coverAlt`, `purpose`.
3. Keep `draft: true` while you write. A draft has no page and appears in no list, filter, sitemap, or social image.
4. When it is ready, set `draft: false` and choose the remaining settings:
   - `featured: true` shows it in Home "Selected work". The heading counts the featured projects. If none are featured, Home shows the first two by `order`.
   - `order` sets the position in lists and the "Next project" link (lower comes first).
   - `earlier: true` moves it into the smaller "Earlier practice" list on `/projects`.
   - `category` adds it to the Category filter. Filters appear only when there are 2 or more distinct values.

Optional sections, each shown only when filled:

- **Screenshots**: `coverImage` replaces the illustration; `gallery` holds captioned images that open in the viewer. Files go in `public/projects/<slug>/`.
- **Video**: under `media`, add `type: video` with `src`, `title` and an optional `poster`.
  - YouTube and Vimeo URLs are embedded (YouTube via the privacy-friendly `youtube-nocookie.com`).
  - Local `.mp4`/`.webm` files in `public/projects/<slug>/` play inline.
  - Any other HTTPS link becomes a "Watch video" card.
  - A "Watch demo video" button is added to the project header automatically.
- **Demo note**: `demoStatus` takes a factual line such as "Demo requires a club account." For Badminton, do not create sessions in the real app to make a demo; record the existing app or use screenshots.
- **SQL or analysis results**: `results` with `type: table` (paste the real output as `rows`; numbers, dates and `null` need no quotes) or `type: image` (a chart or screenshot). Tables scroll inside their own box on phones. Only add output you actually ran.
- **Other sections**: `outcomes`, `challenges`, `lessonsLearned`, and `resources` (notebooks, docs, datasets: label + type + URL).

The table of contents appears automatically when a case study has 3 or more sections.

Things that fail the build on purpose:
- a duplicate slug;
- a `#`, `javascript:`, or `mailto:` demo or repository URL;
- a missing image or video file;
- a table row with the wrong number of cells;
- switching a project to `draft: true` while a Portfolio skill group (`skillGroups[].projectSlug` in `src/config/portfolio.ts`) or an evidence link still points to it. Update those references first.

## Blog

1. Copy `src/content/blog/_template-new-post.md` to `src/content/blog/<slug>.md`, which becomes `/blog/<slug>`.
2. Fill `title`, `description`, the real `publishedAt` date, optional `updatedAt` and `tags`. Add an optional `cover` stored in `public/blog/<slug>/`.
3. Keep `draft: true` while writing. A `publishedAt` date in the future also stays private until a build runs on or after that date.
4. Set `draft: false` to publish.

The first published post automatically enables:
- the blog list with search and tag filters (shown once there are 2 or more posts);
- the "Latest article" on Home;
- related posts;
- the RSS feed (`/rss.xml`) and its `<head>` link;
- sitemap entries and a social preview image.

In the article body:
- code blocks get a language label and a Copy button;
- tables scroll on phones;
- an italic line directly under an image becomes its caption;
- `##`/`###` headings feed the table of contents, shown for articles of 3+ minutes with 3+ headings.

Body images are given their size automatically, but they are not schema-checked. Make sure the file exists; `npm run test:build` fails on an image path that is not in the build.

## Check your changes

```sh
npm run dev                # preview at http://localhost:4321
npm run validate:content   # schema and publication rules
npm run check              # types and content schemas
npm run build              # production build; fails on broken content
npm test                   # full suite: unit + build artifacts + browser tests (Chromium and WebKit)
npm run test:links         # optional: checks external links (needs internet)
```

`npm test` needs the Playwright browsers once: `npx playwright install chromium webkit`.

To see what a fully filled or a minimal site looks like without touching real content, run `npm run fixture:ui -- full` or `npm run fixture:ui -- sparse`. These build a throwaway copy in the system temp folder; fixture content never enters `dist/`.

## Not built (features, not missing content)

These would need new code, not just content:

- **No contact form or email sending.** Contact uses `mailto:` and copy-email only.
- **No admin dashboard, login, or database.** Content is edited in the files above.
- **No automatic image resizing.** Files in `public/` are served as uploaded, so export reasonably sized images (about 1600–2000 px wide for screenshots).
- **Markdown body images don't open in the image viewer.** Use a project `gallery` or `results` image for zoomable evidence.
- **Only one resume file.**
- **No analytics, comments, newsletter, or site-wide search.** Search exists on `/projects` and `/blog` only.
- **The site is not deployed or connected to `ianhuynh.me` by this work.** See README → Deploying.
