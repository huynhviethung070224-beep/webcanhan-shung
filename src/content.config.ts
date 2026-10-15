import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema, projectSchema } from './schemas/content';
import { validateContentSourceSlugs } from './utils/validation';

validateContentSourceSlugs('src/content/projects', 'projects');
validateContentSourceSlugs('src/content/blog', 'blog');

/**
 * Projects: one Markdown file per project in `src/content/projects/`.
 * The file name becomes the slug (`dragon-go.md` -> /projects/dragon-go).
 * Files starting with `_` are templates and are ignored by the loader.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

/**
 * Blog: one Markdown file per article in `src/content/blog/`.
 * Drafts (`draft: true`) and `_template-*.md` files never reach public pages.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: blogSchema,
});

export const collections = { projects, blog };
