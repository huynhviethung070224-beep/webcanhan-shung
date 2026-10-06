---
# TEMPLATE — files starting with "_" are ignored by the site, and `draft: true` keeps a post
# out of the public listing, the article routes and the sitemap.
# Copy this file to `<slug>.md` (e.g. `dragongo-retrospective.md` -> /blog/dragongo-retrospective).
title: Article title
description: One or two sentences used in the listing, page metadata and social previews.
publishedAt: 2026-01-01
# updatedAt: 2026-02-01
tags:
  - learning
# Optional cover. Put the file in `public/blog/<slug>/` and set width/height in pixels.
# cover:
#   src: /blog/my-post/cover.png
#   alt: Describe the image
#   width: 1600
#   height: 900
draft: true
---

Open with a short paragraph that says what the article is about and who it is for.

## A heading

Body text. Headings become anchors and feed the table of contents.

```sql
-- Code blocks get a language label and a copy button.
SELECT title FROM books WHERE due_date < CURRENT_DATE;
```

![Describe the image](/blog/my-post/figure.png)
*Captions are the italic line directly after an image.*

| Column | Meaning |
| --- | --- |
| Tables | Render with horizontal scroll on small screens |

Close with what you learned or what comes next.
