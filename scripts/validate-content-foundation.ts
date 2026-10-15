import assert from 'node:assert/strict';
import { blogSchema, projectSchema } from '../src/schemas/content.ts';
import { isPublishedBlogData } from '../src/utils/publication.ts';

// State 1: minimal/current-style records remain valid without optional content.
projectSchema.parse({
  title: 'Fixture project',
  role: 'Developer',
  tagline: 'Private validation fixture.',
  summary: 'This fixture validates the schema and is never loaded as public content.',
  technologies: ['TypeScript'],
  cover: 'orbit',
  coverAlt: 'Abstract fixture cover.',
  purpose: 'Validate the minimum project contract.',
});

// State 2: drafts and scheduled posts must not pass the public predicate.
const now = new Date('2026-10-15T12:00:00Z');
const draft = blogSchema.parse({
  title: 'Draft fixture',
  description: 'Private fixture.',
  publishedAt: '2026-10-01',
  draft: true,
});
const scheduled = blogSchema.parse({
  title: 'Scheduled fixture',
  description: 'Private fixture.',
  publishedAt: '2026-10-16',
});
assert.equal(isPublishedBlogData(draft, now), false);
assert.equal(isPublishedBlogData(scheduled, now), false);

// State 3: a complete record validates without becoming site content.
projectSchema.parse({
  title: 'Complete private fixture',
  role: 'Data Analyst',
  tagline: 'Exercises every project field.',
  summary: 'A non-public object used only by this validation script.',
  technologies: ['Python', 'SQL'],
  category: 'Data Analysis',
  cover: 'schema',
  coverAlt: 'Fixture entity relationship diagram.',
  coverImage: {
    src: '/projects/library-management-system/erd.png',
    alt: 'Fixture using an existing local image.',
    width: 2254,
    height: 1716,
  },
  coverFit: 'contain',
  coverFrame: 'plain',
  earlier: false,
  demoUrl: 'https://example.com/demo',
  repoUrl: 'https://github.com/example/example',
  demoStatus: 'Recorded walkthrough only.',
  purpose: 'Validate the complete project contract.',
  period: '2026',
  teamSize: '1 person',
  status: 'Fixture',
  outcomes: ['Verified fixture outcome.'],
  media: [
    {
      type: 'video',
      src: 'https://example.com/demo.mp4',
      title: 'Fixture walkthrough',
      poster: '/projects/dragon-go/home.webp',
    },
  ],
  results: [
    {
      type: 'table',
      title: 'Fixture result',
      columns: ['Measure', 'Value'],
      rows: [['Rows checked', '10']],
    },
    {
      type: 'image',
      title: 'Fixture chart',
      src: '/projects/library-management-system/erd.png',
      alt: 'Fixture result chart.',
      width: 2254,
      height: 1716,
    },
  ],
  challenges: ['Fixture challenge.'],
  lessonsLearned: ['Fixture lesson.'],
  resources: [
    { label: 'Notebook', type: 'notebook', url: 'https://example.com/notebook' },
    { label: 'Local report', type: 'report', url: '/projects/library-management-system/erd.png' },
  ],
  analysis: {
    question: 'What does the fixture validate?',
    dataSources: ['Synthetic validation input.'],
    methods: ['Schema parsing.'],
    findings: ['All supported fields parse.'],
    charts: [],
    limitations: ['This is not a published project.'],
  },
  gallery: [
    {
      src: '/projects/dragon-go/home.webp',
      alt: 'Fixture gallery image.',
      width: 1600,
      height: 962,
      frame: 'browser',
    },
  ],
  order: 99,
  featured: false,
  draft: true,
});

const brokenAsset = projectSchema.safeParse({
  title: 'Broken asset fixture',
  role: 'Developer',
  tagline: 'Must fail clearly.',
  summary: 'Validates the missing asset error.',
  technologies: ['TypeScript'],
  cover: 'orbit',
  coverAlt: 'Fixture cover.',
  coverImage: { src: '/projects/missing.png', alt: 'Missing.', width: 1, height: 1 },
  purpose: 'Exercise asset validation.',
});
assert.equal(brokenAsset.success, false);
if (!brokenAsset.success) {
  assert.deepEqual(brokenAsset.error.issues[0]?.path, ['coverImage', 'src']);
  assert.match(brokenAsset.error.issues[0]?.message ?? '', /does not exist/);
}

console.log('Content foundation fixtures passed: minimal, private draft/future, complete record, broken asset.');
