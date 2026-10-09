import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects: one Markdown file per project in `src/content/projects/`.
 * The file name becomes the slug (`dragon-go.md` -> /projects/dragon-go).
 * Files starting with `_` are templates and are ignored by the loader.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    /** One-paragraph approved description (verbatim). */
    summary: z.string(),
    /** Short line used in compact previews. */
    tagline: z.string(),
    technologies: z.array(z.string()).min(1),
    /** Illustrative cover variant until real screenshots are supplied. */
    cover: z.enum(['orbit', 'schema']),
    coverAlt: z.string(),
    /** Real screenshot (inside `public/`). Replaces the illustrative cover when set. */
    coverImage: z
      .object({ src: z.string(), alt: z.string(), width: z.number(), height: z.number() })
      .optional(),
    /** How the cover image sits in the frame. Diagrams and logos use contain. */
    coverFit: z.enum(['cover', 'contain']).default('cover'),
    demoUrl: z.url().optional(),
    repoUrl: z.url().optional(),
    /** Compact factual overview shown at the top of the case study. */
    purpose: z.string(),
    /** Optional facts; rendered only when supplied. */
    period: z.string().optional(),
    teamSize: z.string().optional(),
    status: z.string().optional(),
    outcomes: z.array(z.string()).optional(),
    /** Captioned evidence images (inside `public/`). */
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
          width: z.number(),
          height: z.number(),
        }),
      )
      .default([]),
    order: z.number().default(0),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/**
 * Blog: one Markdown file per article in `src/content/blog/`.
 * Drafts (`draft: true`) and `_template-*.md` files never reach public pages.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    cover: z
      .object({ src: z.string(), alt: z.string(), width: z.number(), height: z.number() })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
