import { z } from 'astro/zod';
import { validatePublicAsset } from '../utils/validation.ts';

const nonEmpty = z.string().trim().min(1);

export const publicAssetPathSchema = z.string().superRefine((src, context) => {
  try {
    validatePublicAsset(src, 'local asset');
  } catch (error) {
    context.addIssue({
      code: 'custom',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

const externalUrlSchema = z.url().refine((url) => {
  try {
    const protocol = new URL(url).protocol;
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}, 'Only HTTP(S) URLs are supported; placeholders such as "#" are not allowed.');
const linkTargetSchema = z.union([externalUrlSchema, publicAssetPathSchema]);

export const imageAssetSchema = z.object({
  src: publicAssetPathSchema,
  alt: nonEmpty,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const galleryItemSchema = imageAssetSchema.extend({
  caption: nonEmpty.optional(),
  frame: z.enum(['browser', 'plain']).default('plain'),
});

const mediaItemSchema = z.discriminatedUnion('type', [
  imageAssetSchema.extend({
    type: z.literal('image'),
    caption: nonEmpty.optional(),
  }),
  z.object({
    type: z.literal('video'),
    src: linkTargetSchema,
    title: nonEmpty,
    caption: nonEmpty.optional(),
    poster: publicAssetPathSchema.optional(),
  }),
]);

// YAML turns bare numbers, booleans, dates and `null` into non-strings; pasted SQL output should still work.
const resultCellSchema = z
  .union([z.string(), z.number(), z.boolean(), z.date(), z.null()])
  .transform((cell) =>
    cell === null ? 'NULL' : cell instanceof Date ? cell.toISOString().slice(0, 10) : String(cell),
  );

const resultSchema = z.discriminatedUnion('type', [
  imageAssetSchema.extend({
    type: z.literal('image'),
    title: nonEmpty.optional(),
    caption: nonEmpty.optional(),
  }),
  z
    .object({
      type: z.literal('table'),
      title: nonEmpty,
      columns: z.array(nonEmpty).min(1),
      rows: z.array(z.array(resultCellSchema)).min(1),
      note: nonEmpty.optional(),
    })
    .superRefine((table, context) => {
      table.rows.forEach((row, index) => {
        if (row.length !== table.columns.length) {
          context.addIssue({
            code: 'custom',
            path: ['rows', index],
            message: `Expected ${table.columns.length} cells to match the table columns; received ${row.length}.`,
          });
        }
      });
    }),
]);

const analysisSchema = z.object({
  question: nonEmpty,
  dataSources: z.array(nonEmpty).min(1),
  methods: z.array(nonEmpty).min(1),
  findings: z.array(nonEmpty).default([]),
  charts: z.array(imageAssetSchema.extend({ caption: nonEmpty.optional() })).default([]),
  limitations: z.array(nonEmpty).default([]),
});

export const projectSchema = z.object({
  title: nonEmpty,
  role: nonEmpty,
  summary: nonEmpty,
  tagline: nonEmpty,
  technologies: z.array(nonEmpty).min(1),
  category: nonEmpty.optional(),
  cover: z.enum(['orbit', 'schema']),
  coverAlt: nonEmpty,
  coverImage: imageAssetSchema.optional(),
  coverFit: z.enum(['cover', 'contain']).default('cover'),
  coverFrame: z.enum(['browser', 'plain']).default('plain'),
  earlier: z.boolean().default(false),
  demoUrl: externalUrlSchema.optional(),
  repoUrl: externalUrlSchema.optional(),
  demoStatus: nonEmpty.optional(),
  purpose: nonEmpty,
  period: nonEmpty.optional(),
  teamSize: nonEmpty.optional(),
  status: nonEmpty.optional(),
  outcomes: z.array(nonEmpty).optional(),
  media: z.array(mediaItemSchema).default([]),
  results: z.array(resultSchema).default([]),
  challenges: z.array(nonEmpty).default([]),
  lessonsLearned: z.array(nonEmpty).default([]),
  resources: z
    .array(
      z.object({
        label: nonEmpty,
        type: z.enum(['documentation', 'notebook', 'dataset', 'report', 'other']).default('other'),
        url: linkTargetSchema,
      }),
    )
    .default([]),
  analysis: analysisSchema.optional(),
  gallery: z.array(galleryItemSchema).default([]),
  order: z.number().int().default(0),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export const blogSchema = z
  .object({
    title: nonEmpty,
    description: nonEmpty,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(nonEmpty).default([]),
    cover: imageAssetSchema.optional(),
    draft: z.boolean().default(false),
  })
  .superRefine((post, context) => {
    if (post.updatedAt && post.updatedAt < post.publishedAt) {
      context.addIssue({
        code: 'custom',
        path: ['updatedAt'],
        message: 'updatedAt must be the same as or later than publishedAt.',
      });
    }
  });

export type ProjectData = z.infer<typeof projectSchema>;
export type BlogData = z.infer<typeof blogSchema>;
