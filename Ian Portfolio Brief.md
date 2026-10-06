# Huynh Viet Hung (Ian) — Portfolio brief for Cursor

Paste the following brief into Cursor with Claude Fable 5.1. The chosen visual direction is **Midnight**. The other concepts shown in the conversation are alternatives, not additional pages to implement.

This is a self-contained implementation brief. Use it as the source of truth; access to earlier conversations or visual previews is not required. Make routine implementation decisions, briefly explain the plan, and proceed to a complete runnable first version. Record missing owner content for the handoff while completing everything that can be built from the information here.

## Fixed decisions

- Public identity: **Huynh Viet Hung (Ian)**.
- Visual direction: **Midnight**, with charcoal surfaces, warm white typography, and restrained pale-lime accents.
- Primary pages: **Home, About Me, Portfolio, Projects, Blog, Contact**.
- Featured projects: **DragonGo** and **Library Management System**, with individual case-study pages.
- Social links: the exact five approved URLs in this document.
- Future custom domain: **ianhuynh.me**.
- Primary language: English. Preserve the approved introduction and project descriptions verbatim. Bilingual content is a later option.

---

Build a polished, multi-page personal website for **Huynh Viet Hung (Ian)**, a Data Science student at Drexel University. The audience is internship/co-op recruiters, collaborators, and people interested in my work. Treat this as a bespoke portfolio with careful typography, composition, and project presentation.

Inspect the existing repository first. Preserve its framework and conventions when suitable. For an empty repository, the preferred foundation is **Astro + TypeScript**, static output, reusable components, and custom CSS design tokens. This site is primarily a multi-page portfolio and publication, and Astro supports content collections for structured Markdown content. Add client-side behavior where interactions require it. Keep dependencies proportionate to the actual experience and use current stable APIs from official documentation.

## Selected custom domain

- Owner-selected domain: **`ianhuynh.me`**.
- Planned production origin: **`https://ianhuynh.me`**.
- Keep the full displayed name **Huynh Viet Hung (Ian)** throughout the website.
- The domain is selected for future registration and connection; registration, availability, and hosting configuration have not been confirmed.
- Store the site origin in a central configuration so page metadata, canonical URLs, the sitemap, and social-sharing URLs can use the chosen domain once it is connected.

## Visual direction: Midnight

- Background: charcoal `#111411`; primary text: warm white `#F4F6ED`; secondary text: `#B0B5B0`; accent: pale lime `#D5F78B`; restrained borders: `#2B2F2B`.
- Preferred font pairing: **Manrope** for headings and body, **Instrument Serif italic** used sparingly for “(Ian)”, and a system monospace for small labels/code. Provide suitable fallbacks, load only needed weights, and check glyph support before introducing Vietnamese text. Keep the visual result coherent if a custom font is unavailable.
- Make the name the dominant hero element. Use responsive heading sizes around 76–104px on large screens and 44–60px on mobile. Adjust wrapping carefully so “Huynh Viet Hung” and “(Ian)” read as one identity.
- Use a content width around 1120px, generous section spacing, subtle separators, and deliberate alignment. Body text should be around 16–18px with comfortable line spacing.
- Use one restrained abstract visual behind the hero: an orbit or connected structure suggesting data and software. Keep it quiet enough that the name and introduction remain readable.
- Give each project an individual cover composition. Use real screenshots when supplied. Until then, use clearly illustrative title-based covers; do not fabricate screenshots of a working product.
- Desktop projects may use an asymmetric two-column arrangement. On mobile, stack them with readable titles, visible roles, and accessible controls.

## Site structure — separate pages

The owner requests separate About Me, Contact, Portfolio, Projects, and Blog pages. Add a Home page at the root. Preserve all five requested destinations with distinct roles.

| Page | Route | Purpose and content |
| --- | --- | --- |
| Home | `/` | Full name, exact approved introduction, a distinctive hero composition, two selected-project previews, and links to Portfolio, Projects, About Me, and Contact. A latest-post preview may appear once a real post exists. |
| About Me | `/about` | Personal background, education at Drexel, interests in data/software/AI, documented experience, and owner-supplied portrait or personal photos. Include a concise education/experience timeline only from confirmed details. |
| Portfolio | `/portfolio` | A professional overview of capabilities: verified skills, experience/contributions, selected-work summaries, and an owner-approved CV download. Explain the evidence behind skills by linking to relevant projects. |
| Projects | `/projects` | The project collection, initially exactly DragonGo and Library Management System. Each project has its own cover, role, short description, technology tags, and link to its case study. |
| Blog | `/blog` | An index of the owner's genuine articles about learning, data, software, project decisions, and internship reflections. Render real title, publication date, excerpt, and reading time when the source content exists. |
| Contact | `/contact` | The full “Connect with me” social-link collection and an email action when the preferred contact address is supplied. |

Portfolio presents the owner's professional capabilities and evidence as a whole. Projects focuses on individual products and technical case studies. Keep both useful without duplicating complete descriptions.

Use the name/brand link to return Home. The shared navigation should include About Me, Portfolio, Projects, Blog, and Contact, with a clear active-page state. On phones, provide an accessible compact menu. Keep typography, spacing, colors, and footer treatment consistent across pages while giving each page a distinct composition.

CV and repository/demo links should be rendered only when real destinations are supplied. Keep missing assets and URLs in central content/config files and document them in the handoff. Each selected project opens its own detailed case-study page within this website, even when an external demo URL is unavailable. Direct route loads and refreshes must work.

## Blog and content maintenance

- Blog articles have individual URLs such as `/blog/<slug>`.
- Each article includes a title, real date, actual body content, and a link back to Blog. Derive reading time from the real content.
- Support readable headings, images with captions, code blocks, tables, and links. A table of contents is helpful for longer posts; include a copy-code action where code is present.
- Keep articles in a simple editable content structure compatible with the repository, such as Markdown/MDX or structured local content. Keep profile, projects, and social links editable separately from presentation components.
- No real blog articles have been supplied yet. Build the page and article layout with a useful empty state. Keep proposed topics as drafts or content suggestions in the handoff rather than publishing fabricated posts or dates.
- Potential owner-authored topics: a DragonGo project retrospective, lessons from relational database design, and reflections on learning software development through real projects. These are suggestions, not existing publications.

## Project detail pages

- Routes: `/projects/dragon-go` and `/projects/library-management-system`.
- Keep the same Midnight visual identity, full name, navigation, and typography as the homepage.
- Start with the project title, role, technology tags, and a large supplied screenshot or clearly illustrative cover.
- DragonGo sections: overview and hackathon context; supplied screenshots/demo; confirmed features; personal backend/database contributions; technical decisions or lessons only when documented; real demo/source links when supplied.
- Library Management System sections: purpose; actual ERD and relationships between the six tables when the schema is supplied; representative SQL queries and their real outputs when supplied; database design contributions and documented lessons; real source link when supplied.
- Include “Back to Projects” and “Next Project” navigation. Detail-page URLs should work when opened directly or refreshed.
- Write only factual detail that is available. Keep requests for missing screenshots, schema, queries, outcomes, and URLs in the handoff rather than inventing project evidence.

## Connect section

- Place the complete social-link collection on the Contact page at `/contact`. Link to this destination from shared navigation and the footer. It should feel like part of the portfolio rather than a separate service.
- Use compact link tiles with a recognizable platform icon, visible platform name, optional supplied handle, and a small external-link indicator. Use consistent monochrome treatment with the lime accent on hover/focus.
- Render the five approved profiles listed below: YouTube, Facebook, Instagram, GitHub, and LinkedIn. Support additional owner-supplied links through the same data structure.
- Arrange tiles in three columns on desktop, two on tablet, and one on narrow phones. Keep labels readable and touch targets comfortable.
- Clicking a populated profile tile opens that exact profile in a new tab with `rel="noopener noreferrer"`. Provide clear keyboard focus and an accessible label identifying the platform and new-tab behavior.
- Give email a distinct action within the same section. Use a supplied email address; if a copy-email action is included, provide visible success feedback.
- Store link data in one array of objects, for example: `platform`, `label`, `url`, `handle`, and `icon`. The owner should be able to add or remove platforms by editing this list.
- Use the exact owner-supplied URLs below. Preserve spelling, case, underscores, and the `-beep` suffix on the GitHub username. In the published version, render only entries with real owner-supplied destinations. Additional platforms and the preferred email address can be added through the same configuration.

### Approved social links

| Platform | Handle | Exact URL |
| --- | --- | --- |
| YouTube | `@huynhviethung4151` | https://www.youtube.com/@huynhviethung4151 |
| Facebook | `BEGATLOKI` | https://www.facebook.com/BEGATLOKI |
| LinkedIn | `viethunghuynh07` | https://www.linkedin.com/in/viethunghuynh07/ |
| Instagram | `@lokian__07` | https://www.instagram.com/lokian__07/ |
| GitHub | `huynhviethung070224-beep` | https://github.com/huynhviethung070224-beep |

Suggested presentation order: GitHub, LinkedIn, YouTube, Instagram, Facebook. Keep all five in the same Connect section on the Contact page.

## Approved introduction — preserve this wording

Hi, I’m Huynh Viet Hung (Ian), a Data Science student at Drexel University interested in data, software development, and AI. I turn ideas into working applications and explore how technology can solve practical problems. Through my projects and internship experience, I’m building technical skills alongside an understanding of how businesses work.

## Approved projects

### DragonGo

Role: Backend & Database Developer

A campus navigation app combining schedule-aware route planning with AI-assisted scheduling. I contributed to the backend and database, integrating Firebase Authentication and synchronizing users’ personal schedules and account data.

Technologies: JavaScript, Firebase Authentication, Cloud Firestore.

### Library Management System

Role: SQL Database Developer

A PostgreSQL project for managing books, members, branches, and borrowing records. I designed a normalized database with six relational tables and developed SQL reports covering overdue books, rental income, borrowing activity, and branch performance.

Technologies: PostgreSQL, SQL.

## Motion and interaction

- Use a short, coordinated hero entrance and subtle reveals for later sections. Keep the content visible if scripts or animations fail.
- Add small hover/focus changes to buttons, links, and project covers. Essential information and navigation must work on touch and keyboard.
- Keep native page scrolling. Use CSS for straightforward effects; reuse an existing animation library if helpful.
- Respect `prefers-reduced-motion`. Keep decorative motion restrained and avoid motion that delays access to the portfolio.
- Project and social links must have meaningful labels and clear keyboard focus. Use reduced motion for section reveals and link-tile effects.

## Baseline polish for this multi-page website

- Consistent navigation, active-page state, subtle route/section transitions, and a designed 404 page with clear routes back to Home and Projects.
- Clear personal identity: full name and nickname, strong typography, a distinctive visual motif, favicon, and supplied personal/project imagery.
- Project evidence: supplied screenshots, short demos, real ERD, and representative query outputs. Use authentic evidence once available rather than decorative substitutes for technical substance.
- A readable mobile layout, keyboard access, adequate contrast, reduced-motion behavior, optimized images, and stable image dimensions to minimize layout shifts.
- A unique page title and description per route, social-sharing preview metadata and images, and a sitemap when appropriate for the deployed site. Use the selected production origin `https://ianhuynh.me` once that domain is connected; use the actual preview origin for preview environments.
- Content/config structure that makes it straightforward to add a project, edit the biography, update social links, and publish a real blog article.

## Signature composition and visual craft

The defining visual relationship is between data and software: a quiet orbit, path, or connected structure in the hero, echoed in the DragonGo and database project covers. Use original SVG/CSS geometry and typography. Keep this motif subordinate to the owner and the work.

- Use a deliberate editorial layout: oversized name, compact metadata, a comfortable text column, and generous open space. Change scale and composition between sections rather than making every section an identical card grid.
- Establish a spacing scale and a small set of reusable radii, button heights, borders, and shadows. Use approximately 20px page gutters on small phones, 32px on tablets, and 48–64px on large screens, adjusted to the content width.
- Use lime to direct attention to a primary action, selected state, or small detail. Keep large reading surfaces charcoal and text warm white.
- Keep prose roughly 60–70 characters per line, with clear heading hierarchy. Align project metadata, links, and image edges carefully.
- Create an original small typographic brand mark/favicon consistent with the full identity. The full name must remain visible in the site branding.
- Give DragonGo and Library Management System different cover compositions, tied together by the same visual system. Use purposeful type-based covers until authentic project images are supplied.
- A cover may move very slightly on hover and have an arrow transition; all actions must remain apparent without hovering.
- Let visual hierarchy and the actual work carry the presentation. Use each decorative effect only where it improves that composition.

## Page-specific design and substance

### Home — introduction and orientation

- Within the first screen, make the full name, Data Science context, and route to the work clear.
- Present the exact approved introduction below the name, followed by a primary “View Projects” link and a quieter “About Me” link.
- Follow with the two featured projects. Each preview needs a strong cover, project name, role, and concise summary.
- Add a small preview of the professional Portfolio so recruiters can reach the capabilities/CV page quickly. Show a latest article only after genuine published content exists.
- End with a simple route to Contact. Keep the complete social-link collection on Contact.

### About Me — the person behind the work

- Use a more personal editorial layout, with a supplied portrait/photo when available and well-spaced narrative sections.
- Safe background facts: the owner is a Data Science student at Drexel University, is from Vietnam, is interested in data/software/AI, and has internship experience in Vietnam. The owner's stated interests include badminton, golf, and basketball.
- Build a concise narrative around those supplied facts; do not invent personal motivations, employer details, awards, dates, or future commitments.
- A short “Beyond the screen” section may present the stated interests. Personal photos can be added later through configuration.
- Education and experience timelines should use only owner-supplied, confirmed entries. Without a portrait, use a deliberate typographic composition rather than an empty image frame.

### Portfolio — a quick professional overview

- Design this page so a recruiter can quickly find the education context, skills, project evidence, and approved CV.
- Group skills by demonstrated work: JavaScript/Firebase for DragonGo; SQL/PostgreSQL/relational database design for Library Management System. Link evidence back to the corresponding case study.
- Present responsibilities and contributions in plain language. Additional experience or certificates can be added once their current wording is supplied.
- Use the owner's actual role on each project. Describe AI as an interest and as an element of the documented DragonGo project; avoid assigning an unsupported specialist job title.
- Render the CV action once the owner supplies an approved current file. Keep the page useful with the confirmed education and project evidence in the meantime.

### Projects and case studies — inspectable evidence

- The collection starts with two projects and leads directly to their individual pages. Each whole project link should be clearly labeled and keyboard accessible.
- At the beginning of a case study, show a compact factual overview: purpose, role, and stack. Show dates, team size, completion status, and outcomes only when supplied.
- Use this narrative template for expanded content: **problem/context → solution → my contribution → technical decisions → evidence → lessons/next steps**. Populate only the portions supported by real content.
- DragonGo should foreground the relationship between campus routes, schedules, authentication, and per-user data. Explain only the implemented behavior and personal contributions documented here or subsequently supplied.
- Library Management System should foreground relational design and SQL analysis. When supplied, pair each important query with the question it answers, the actual query, a real output, and a short interpretation.
- Use captioned images with an accessible zoom/lightbox when screenshots or ERDs benefit from closer inspection. Include visible close controls and proper focus return.
- A restrained table of contents can help long case studies. Section links should be shareable; include Back to Projects and Next Project.
- Omit optional evidence blocks that lack source material from the public page. Record the missing material in the content checklist rather than exposing implementation TODOs to visitors.

### Blog — a comfortable reading experience

- Use a dedicated reading layout, not the large hero layout from Home. Give article text, headings, code, and figures a consistent rhythm.
- Show accurate article metadata, an optional cover, and the real content. Reading time must be computed from the article.
- For longer articles, use a desktop table of contents, heading anchors, and a small reading-progress indicator; reflow the contents for phones.
- Code blocks need language labels, readable syntax highlighting, and a working copy-code button with success feedback. Wide code blocks can scroll horizontally without making the entire page overflow.
- Add “Copy article link” and Back to Blog. Recommend related posts only when relevant real articles exist.
- Use a concise honest empty state before the first article is published. Draft templates are for the owner/editor and must stay out of the public listing and sitemap.

### Contact — one useful collection of links

- Present a short welcoming introduction, then the five exact social profiles with visible platform names and handles.
- Give GitHub and LinkedIn visual prominence while retaining all five platforms in the same consistent collection.
- Use correct platform brand icons with the shared monochrome treatment and a small external-link indicator. Keep platform labels visible so meaning does not depend on icons.
- Once the preferred email address is supplied, provide an email action and optional copy-email feedback. A message form belongs to the later roadmap until delivery is configured.

## Interaction details that make the experience feel finished

- The shared header has a clearly active page, readable contrast, and a mobile menu that works with touch, keyboard, Escape, and focus return. Keep its height stable between routes.
- Page transitions should be short and subtle, roughly 160–250ms. Small hover changes may be 120–180ms; one-time section reveals may be 300–450ms. These are design targets, not delays before content becomes usable.
- Maintain normal anchor links, browser history, back/forward behavior, and sensible scroll restoration. Ensure focused elements remain visible beneath a sticky header.
- Provide meaningful feedback for copy actions and image zoom. Clipboard failure should leave the underlying email/URL selectable or otherwise available.
- Keep every destination usable with reduced motion, missing animation support, and touch input. Essential content must be rendered before animation runs.
- Design the 404 and Blog empty states in the same visual language as the main site, with useful navigation and concise wording.
- Where supplied, provide direct Live Demo, View Code, and Download CV actions. Profile URLs are not substitutes for individual project repository URLs.

## Content structure and maintenance

Keep the owner able to update this website through Cursor without rewriting page components:

- A site/profile configuration for name, introduction, interests, production origin, preferred contact email, and approved CV path.
- One social-links configuration containing the exact platform URLs and handles above.
- Structured project entries: `slug`, `title`, `role`, `summary`, `technologies`, `cover`, `coverAlt`, optional `demoUrl`/`repoUrl`, and sourced detail content. Optional facts remain absent until confirmed.
- Blog entries with `title`, `slug`, `description`, real `publishedAt`, optional real `updatedAt`, tags, optional cover/alt text, `draft`, and body. Drafts are excluded from public pages and production discovery files.
- Prefer typed/validated content entries when the framework supports them. Build navigation from the fixed route list so labels and destinations stay consistent.
- Provide reusable templates for a new project and a new article, stored as unpublished examples. Document exactly how to add one, add its media, and preview the result.
- Keep links, text, metadata, and asset paths centralized enough to update in one place. Use the chosen production origin only in the environment where the domain is actually connected.

## Performance, discoverability, and quality

- Render the main content as static/server-generated HTML where the selected framework allows it. Ship client JavaScript for necessary interactions.
- Optimize image formats and sizes, include width/height and responsive sources, and lazy-load images below the first screen. Keep the important first-screen assets appropriately prioritized.
- Limit font weights and ensure text remains visible while fonts load. Reuse one animation approach and avoid loading heavy visual libraries for a simple geometric accent.
- Use semantic landmarks, one clear main heading per page, descriptive image alternatives, visible focus states, and comfortable touch targets. Check the actual text/background pairings.
- Give every page a specific title and description, canonical URL, and matching social-preview metadata. Create a reusable preview-image layout with the owner's identity plus the page/project/article title.
- Build sitemap/robots configuration from real production routes. Include published article routes; omit drafts. Add an RSS feed when genuine articles exist if it fits the chosen framework.
- Performance review should consider loading, interaction response, and layout stability. Aim for the current good Core Web Vitals thresholds, and distinguish development lab measurements from real-user field data.

## Missing owner inputs — finish the design while tracking these

| Input | Current state | Handling |
| --- | --- | --- |
| Name, introduction, selected projects, social profiles | Supplied in this brief | Use exactly as approved. |
| Custom domain | Selected; registration/connection unconfirmed | Keep future production origin configurable. |
| Current approved CV PDF | Not supplied for this website | Prepare the configurable action; publish it once a real approved file exists. |
| Preferred public contact email | Not selected for this website | Keep email actions configurable; the five social links already work as contact routes. |
| Portrait and personal photos | Not supplied | Complete the About layout with typography; make authentic images easy to add later. |
| DragonGo screenshots, demo URL, project repository URL | Not supplied here | Use the approved description and an illustrative cover; record the missing assets. |
| Library schema/ERD, SQL examples, actual output, repository URL | Not supplied here | Use the approved description; add evidence only from actual source files. |
| Detailed decisions, outcomes, dates, and lessons | Not supplied beyond the approved descriptions | Build the article template; fill it with sourced facts rather than invented narrative. |
| Blog articles | Not supplied | Complete the Blog shell and unpublished article template. |

## Suggested later additions — advisory roadmap

These are options for the owner to choose later, not automatic implementation requirements:

- Register and connect the selected custom domain `ianhuynh.me` when the owner is ready.
- An English/Vietnamese language switch after both versions of the content are supplied.
- A light-theme option that receives the same design attention as Midnight.
- Blog search and category filters once there are enough real posts to make them useful.
- A content editor/CMS if file-based writing becomes inconvenient.
- A message form once its actual delivery service, destination, and success/error behavior are chosen.

Relevant implementation references: [Astro overview](https://docs.astro.build/en/concepts/why-astro/), [Astro content collections](https://docs.astro.build/en/guides/content-collections/), [Manrope](https://fonts.google.com/specimen/Manrope), [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), [Web Vitals](https://web.dev/articles/vitals), [reduced motion](https://web.dev/articles/prefers-reduced-motion), and [Open Graph](https://ogp.me/).

## Implementation and review

1. Inspect the repository and assets, then write a concise plan and design tokens. If starting fresh, use the preferred Astro/TypeScript foundation above. Make routine decisions and proceed with the implementation.
2. Build the shared shell and a recognizable Home page, then all five other primary pages and both project detail routes. Use real content from this brief throughout.
3. Implement the reusable article layout and unpublished content templates, social actions, metadata, responsive behavior, and necessary interaction states.
4. Run the relevant build/type checks for the chosen setup. Review representative screens at 390px, 768px, and 1440px, including at least a phone Home/Contact view and a desktop case study. Check narrow 320px layouts for horizontal overflow.
5. If browser tools are available, capture screenshots, identify specific visual problems, and revise them. Review typography, wrapping, spacing, covers, navigation, focus, reduced motion, and small-screen interactions. Use measured results for any performance claim.
6. Verify all six primary routes, both case studies, direct loads/refreshes, browser back/forward, exact social destinations, Blog/404 states, titles, and sharing metadata. For any feature depending on missing content, verify the intended fallback and record that dependency.
7. Finish with a runnable source project, the commands to develop/build/preview it, a practical README, a content/asset checklist, and a short summary of checks completed. Explain how to update the profile, add projects/posts, attach the CV, and connect `ianhuynh.me` once registered. Domain registration and external hosting changes are separate future work.

### Acceptance criteria

- All requested pages exist, are visibly distinct, and share a coherent Midnight identity.
- The exact name, introduction, two project descriptions, and five social URLs remain intact.
- Project cards open real internal case-study routes; direct visits and refreshes work.
- The Contact page has all five correct external profiles. Available actions work and provide appropriate feedback.
- Blog infrastructure works with zero published posts; drafts never appear as published content.
- Mobile layouts are intentional, text is readable, controls are accessible, and the page itself does not overflow horizontally.
- Metadata uses real route/content information and the correct environment origin.
- Missing images, CV, email, project URLs, or technical evidence produce a deliberate finished layout rather than broken controls or public TODO text.
- Build/check results, visual verification limits, and missing owner inputs are reported accurately.

The result should feel carefully composed across the entire site: a striking Home page, a personal About Me page, a credible professional Portfolio, convincing Projects and case studies, a readable Blog, and a cohesive Contact page.
