# Content and asset checklist

What the site still needs from the owner, where it goes, and what the site shows in the meantime. Nothing below is exposed as a public TODO; every gap has a finished fallback.

## Status

| Input | State | Where to add it | Current fallback |
| --- | --- | --- | --- |
| Name, introduction, two project descriptions, roles, technologies, five social URLs | Supplied, used verbatim | `src/config/site.ts`, `src/content/projects/*.md`, `src/config/social.ts` | — |
| Custom domain `ianhuynh.me` | Selected; registration and hosting connection unconfirmed | `productionOrigin` in `src/config/site.ts`; `PUBLIC_SITE_ORIGIN` env for previews/temporary hosts | Metadata uses the planned origin; preview deployments use their own URL |
| Approved CV (PDF) | Not supplied | `public/cv/<file>.pdf` + `cvPath` in `src/config/site.ts` | Portfolio shows "See the projects" / "Get in touch" instead of Download CV |
| Preferred public contact email | `huynhviethung070224@gmail.com`, from the LinkedIn PDF contact line | `contactEmail` in `src/config/site.ts` | Contact page shows a mailto and copy action |
| Portrait / personal photos | Removed at the owner's request | `portrait` in `src/config/site.ts` | About uses the typographic monogram |
| Education dates, program details | LinkedIn PDF: Drexel CCI, Bachelor’s in Data Science, Sep 2025–Jun 2030; ISHCMC American Academy high school diploma, Sep 2022–Jun 2025. Headline also says Honors. | `education[]` in `src/config/site.ts` | Shown on About and Portfolio |
| Internship employer, role, dates | LinkedIn PDF: TPCOMS Software & Data Engineering Co-op, Ho Chi Minh City, Sep 2026–Present; Drexel VSA core team, Philadelphia, Oct 2025–Present. CodeFest is not on the PDF and was removed. | `experience[]` in `src/config/site.ts` | Shown on About and Portfolio |
| Certificates / additional experience | LinkedIn PDF names two certificates and does not list issuers or dates | `certificates[]` in `src/config/portfolio.ts` | Titles only, no issuer line |
| DragonGo screenshots | The local project has a logo only (`frontend/logo.png`). No screen recording or UI screenshot. | `coverImage` in `dragon-go.md` | The logo is the cover |
| DragonGo demo URL, repository URL | Not supplied | `demoUrl`, `repoUrl` in `dragon-go.md` | Live Demo / View Code buttons hidden |
| DragonGo hackathon name, dates, team size, outcomes, technical decisions, lessons | Not supplied | `period`, `teamSize`, `status`, `outcomes` frontmatter; "Technical decisions" / "Lessons" sections in the body | Case study covers overview, contribution and how the pieces relate, from the approved text only |
| Library Management System ERD / schema (six tables) | `DB setup.png` from the local library project folder. The stock `library.jpg` illustration was not used. | `coverImage` and `gallery` in `library-management-system.md` | ERD is the cover and can be zoomed |
| Library Management System SQL queries and real outputs | Overdue query and branch-performance description are in the repo. No saved query output. | Body of `library-management-system.md` | Query is shown; result tables are not |
| Library Management System repository URL | https://github.com/huynhviethung070224-beep/SQL_Library_Management_P2 | `repoUrl` in `library-management-system.md` | View Code is shown |
| Blog articles | None written | `src/content/blog/<slug>.md` from `_template-new-post.md` | Designed empty state; RSS not emitted; no "Latest article" on Home |
| Personal/project imagery for social previews | Not supplied | Generated OG images already exist per page; replace by editing `src/utils/og.ts` if photos should be used | Typographic OG template with identity + title |

## Suggested article topics (drafts, not publications)

These were proposed by the owner as possible topics. None exist as articles yet; do not publish placeholder posts.

1. DragonGo project retrospective — what the backend/database work involved, Firebase Authentication + Firestore sync decisions.
2. Lessons from relational database design — normalizing the six-table library schema, what changed and why.
3. Learning software development through real projects — reflections from internship and project work.

## How to supply evidence without inventing it

- Screenshots: export at 2× (e.g. 1600×1000) as PNG/WebP, note the pixel size, write a one-sentence caption that states what is shown.
- ERD: export from the modelling tool as PNG/SVG; the caption should name the six tables and the key relationships.
- SQL: paste the actual query text and the actual output (first N rows is fine). Add one or two sentences on what the result tells the library.
- Outcomes/dates/team: add only what can be confirmed (e.g. hackathon name and date, team size).

## Verification completed (October 2026)

- `npm run check` (astro check): 0 errors, 0 warnings. `npm run build`: 9 pages + 8 OG images, sitemap, robots.
- Playwright screenshots at 320 / 390 / 768 / 1440 px for all primary routes, both case studies and 404: no horizontal overflow at any width.
- Mobile menu: opens with focus on the close control, closes on Escape and returns focus to the trigger, links navigate and show the active page.
- Contact: all five tiles point to the exact approved URLs with `target="_blank"` and `rel="noopener noreferrer"` and accessible "(opens in a new tab)" labels.
- Blog: verified with a temporary post (deleted afterwards) — reading time, TOC with active state, code label + copy (clipboard verified), table wrapper, progress bar, copy-article-link; `draft: true` removed it from routes, sitemap, RSS and OG output.
- axe-core (WCAG 2.1 AA + best practices) at 390 and 1440 px on all routes: 0 violations after fixes.
- Lighthouse (lab, local preview build): Home, DragonGo case study, Contact — Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100 (desktop preset); Home mobile simulated: Performance 100, LCP 1.4 s, CLS 0, TBT 0 ms. These are lab numbers, not field data.
- Not verified: real-device testing, the lightbox with real images (no images supplied yet; the component is wired for `gallery` entries), and hosting/domain behaviour.
