# Huynh Viet Hung (Ian) — Personal website

Multi-page portfolio for **Huynh Viet Hung (Ian)**, Data Science student at Drexel University. Built with **Astro 7 + TypeScript**, static output, custom CSS design tokens ("Midnight" direction), and Markdown content collections for projects and blog posts.

Planned production origin: `https://ianhuynh.me` (domain registration/connection is future work — see [Connecting the domain](#connecting-ianhuynhme)).

## Commands

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm install`     | Install dependencies (Node 22+ recommended)       |
| `npm run dev`     | Dev server at `http://localhost:4321`             |
| `npm run build`   | Static build to `dist/` (also generates OG images, sitemap, robots) |
| `npm run preview` | Serve the production build locally                |
| `npm run check`   | Type-check `.astro` files and content schemas     |

## Pages

| Route                       | File                                   |
| --------------------------- | -------------------------------------- |
| `/`                         | `src/pages/index.astro`                |
| `/about`                    | `src/pages/about.astro`                |
| `/portfolio`                | `src/pages/portfolio.astro`            |
| `/projects`                 | `src/pages/projects/index.astro`       |
| `/projects/<slug>`          | `src/pages/projects/[slug].astro`      |
| `/blog`                     | `src/pages/blog/index.astro`           |
| `/blog/<slug>`              | `src/pages/blog/[slug].astro` + `src/layouts/ArticleLayout.astro` |
| `/contact`                  | `src/pages/contact.astro`              |
| `404`                       | `src/pages/404.astro`                  |
| `/og/<key>.png`             | `src/pages/og/[...key].png.ts` (social preview images) |
| `/rss.xml`                  | `src/pages/rss.xml.ts` (only emitted once a post is published) |
| `/robots.txt`, `/sitemap-index.xml` | generated at build                |

## Where to edit content

Everything an owner normally changes lives in a few files; page components only read from them.

| What                                   | File                                   |
| -------------------------------------- | -------------------------------------- |
| Name, introduction, tagline, facts (school, origin, interests, hobbies), education/experience entries, **contact email**, **CV path**, portrait, production origin | `src/config/site.ts` |
| Social links (platform, label, exact URL, handle, icon, featured) | `src/config/social.ts` |
| Portfolio skill groups and (future) certificates | `src/config/portfolio.ts` |
| Projects (one Markdown file each)      | `src/content/projects/*.md`            |
| Blog posts (one Markdown file each)    | `src/content/blog/*.md`                |
| Content schemas (validated at build)   | `src/content.config.ts`                |
| Design tokens (colors, type scale, spacing) | `src/styles/tokens.css`           |

Files whose name starts with `_` inside `src/content/**` are templates and are ignored by the site.

### Update the profile / introduction

Edit `src/config/site.ts`. The `intro` string is the approved introduction and is rendered verbatim on Home. `displayName` is derived from `fullName` + `nickname`.

### Add the contact email

In `src/config/site.ts` set:

```ts
contactEmail: 'you@example.com',
```

The Contact page then shows an email block with a `mailto:` button and a copy-email action with visible feedback. Leaving it `null` hides every email action.

### Attach the CV

1. Put the approved PDF in `public/cv/`, e.g. `public/cv/huynh-viet-hung-cv.pdf`.
2. In `src/config/site.ts` set `cvPath: '/cv/huynh-viet-hung-cv.pdf'`.

"Download CV" buttons appear on the Portfolio page automatically. Leaving `cvPath: null` keeps the page useful without a broken button.

### Add a portrait

Put the image in `public/about/` and set in `src/config/site.ts`:

```ts
portrait: { src: '/about/portrait.jpg', alt: 'Huynh Viet Hung (Ian) …', width: 1200, height: 1500 },
```

Width/height are the intrinsic pixel size (they prevent layout shift). The typographic monogram is used while this is `null`.

### Add or edit a project

1. Copy `src/content/projects/_template-new-project.md` to `src/content/projects/<slug>.md`. The file name is the URL: `my-app.md` → `/projects/my-app`.
2. Fill in the frontmatter (`title`, `role`, `tagline`, `summary`, `technologies`, `cover`, `coverAlt`, `purpose`, `order`, `featured`) and set `draft: false`.
3. Write the case study body in Markdown using the template headings (Overview → Solution → My contribution → Technical decisions → Evidence → Lessons). Only keep sections you have real content for; `##` headings feed the table of contents.
4. Optional, rendered only when present: `coverImage`, `demoUrl`, `repoUrl`, `period`, `teamSize`, `status`, `outcomes`, `gallery` (captioned images with zoom).
5. Put screenshots/ERDs in `public/projects/<slug>/` and reference them with absolute paths (`/projects/<slug>/erd.png`) plus their pixel `width`/`height`.
6. `npm run dev` and open `/projects/<slug>` to preview. Home shows projects with `featured: true`; the Next Project link follows `order`.

### Publish a blog article

1. Copy `src/content/blog/_template-new-post.md` to `src/content/blog/<slug>.md` (`/blog/<slug>`).
2. Set `title`, `description`, the real `publishedAt` date, optional `updatedAt`, `tags`, optional `cover`, and `draft: false`.
3. Write the body in Markdown. Supported: headings (anchors + TOC), code fences with language (label + copy button + syntax highlighting), tables (scroll horizontally on phones), images with an italic caption line directly under them, links, blockquotes.
4. Reading time is computed from the body. The Blog index, Home "Latest article", RSS feed, sitemap and OG image update automatically.

Drafts (`draft: true`) are excluded from every public page, the sitemap, RSS and OG generation. While there are zero published posts the Blog page shows a designed empty state and `/rss.xml` is not emitted.

### Edit social links

Edit the array in `src/config/social.ts`. Keep URLs exactly as approved. Only entries with a non-empty `url` are rendered. Set `featured: true` for visual prominence (currently GitHub and LinkedIn). Icons available: `github`, `linkedin`, `youtube`, `instagram`, `facebook`, `mail`, `link` (add more in `src/components/Icon.astro`).

## Site origin, metadata and environments

`src/config/site.ts → resolveSiteOrigin()` decides the origin used for canonical URLs, Open Graph URLs/images, the sitemap and robots.txt:

1. `PUBLIC_SITE_ORIGIN` env var, if set (e.g. `https://ian-portfolio.vercel.app` before the domain is connected).
2. On Vercel preview deployments, `https://$VERCEL_URL` (automatic).
3. Otherwise the planned production origin `https://ianhuynh.me`.

On Vercel, until `ianhuynh.me` is connected, set `PUBLIC_SITE_ORIGIN` for the Production environment to the `*.vercel.app` URL so metadata does not point to an unconnected domain. Remove it once the domain is live.

Every page has a unique title, description, canonical URL and a generated 1200×630 preview image (`src/utils/og.ts`, rendered with Satori at build time using the owner's identity + page/project/article title).

## Deploying

The build is fully static (`dist/`). `vercel.json` enables `cleanUrls` so `/about` serves `about.html`; direct loads and refreshes of every route (including case studies) work. Any static host works — configure it to serve `<path>.html` for extension-less paths (Netlify: "Pretty URLs", Cloudflare Pages: default).

### Connecting ianhuynh.me

1. Register `ianhuynh.me` with a registrar (or through the host).
2. Add the domain to the hosting project (Vercel: Project → Settings → Domains) and follow the DNS instructions (A/ALIAS for apex, CNAME for `www`, redirect `www` → apex).
3. Once it resolves with HTTPS, remove any `PUBLIC_SITE_ORIGIN` override so metadata, sitemap and OG URLs use `https://ianhuynh.me`.

## Design notes

- Tokens: charcoal `#111411`, warm white `#F4F6ED`, secondary `#B0B5B0`, pale lime accent `#D5F78B`, borders `#2B2F2B`. Manrope (variable, self-hosted) for text, Instrument Serif italic for "(Ian)", system monospace for labels.
- Motion: CSS-only hero entrance, one small IntersectionObserver for section reveals, native cross-document view transitions for route changes. All respect `prefers-reduced-motion`; content is visible without JavaScript.
- Accessibility: landmarks, one `h1` per page, skip link, visible focus, 44px controls, mobile menu with Escape/focus trap/focus return, external links labelled "(opens in a new tab)".

## Content checklist

Missing owner inputs and how the site currently handles each are tracked in [`CONTENT-CHECKLIST.md`](./CONTENT-CHECKLIST.md).
