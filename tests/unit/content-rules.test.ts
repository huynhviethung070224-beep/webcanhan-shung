/**
 * Unit tests for the content contract: schemas, publication rules, filters and
 * integrity helpers. Run with `npm run test:unit` (Node's built-in test runner).
 */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { blogSchema, projectSchema } from '../../src/schemas/content.ts';
import { isPublishedBlogData } from '../../src/utils/publication.ts';
import { facetOptions, matchesFacet, matchesQuery, normalizeText } from '../../src/utils/filters.ts';
import { countWord, listJoin, plural } from '../../src/utils/format.ts';
import {
  assertInternalLink,
  assertProjectReferences,
  assertUniqueIds,
  validateContentLink,
  validateContentSourceSlugs,
  validatePublicAsset,
} from '../../src/utils/validation.ts';

const minimalProject = {
  title: 'Fixture project',
  role: 'Developer',
  tagline: 'Private test fixture.',
  summary: 'Never loaded as public content.',
  technologies: ['TypeScript'],
  cover: 'orbit',
  coverAlt: 'Abstract fixture cover.',
  purpose: 'Validate the minimum project contract.',
};

describe('project schema', () => {
  it('accepts a minimal record and defaults every optional array to []', () => {
    const data = projectSchema.parse(minimalProject);
    for (const key of ['media', 'results', 'challenges', 'lessonsLearned', 'resources', 'gallery'] as const) {
      assert.deepEqual(data[key], [], key);
    }
    assert.equal(data.featured, false);
    assert.equal(data.draft, false);
    assert.equal(data.order, 0);
    assert.equal(data.outcomes, undefined);
    assert.equal(data.analysis, undefined);
  });

  it('accepts explicit empty arrays', () => {
    const data = projectSchema.parse({ ...minimalProject, media: [], results: [], resources: [], gallery: [], outcomes: [] });
    assert.deepEqual(data.media, []);
  });

  it('rejects missing required fields and empty technologies', () => {
    assert.equal(projectSchema.safeParse({ ...minimalProject, title: '' }).success, false);
    assert.equal(projectSchema.safeParse({ ...minimalProject, technologies: [] }).success, false);
    const { purpose: _omit, ...withoutPurpose } = minimalProject;
    assert.equal(projectSchema.safeParse(withoutPurpose).success, false);
  });

  it('rejects placeholder and non-HTTP links', () => {
    for (const demoUrl of ['#', '', 'javascript:alert(1)', 'mailto:a@b.c']) {
      assert.equal(projectSchema.safeParse({ ...minimalProject, demoUrl }).success, false, demoUrl);
    }
    assert.equal(projectSchema.safeParse({ ...minimalProject, demoUrl: 'https://example.com' }).success, true);
  });

  it('names the field and file when a configured local asset is missing', () => {
    const result = projectSchema.safeParse({
      ...minimalProject,
      coverImage: { src: '/projects/missing.png', alt: 'Missing.', width: 1, height: 1 },
    });
    assert.equal(result.success, false);
    assert.deepEqual(result.error?.issues[0]?.path, ['coverImage', 'src']);
    assert.match(result.error?.issues[0]?.message ?? '', /does not exist/);
  });

  it('requires alt text and positive intrinsic size for images', () => {
    const image = { src: '/projects/dragon-go/home.webp', alt: 'Home.', width: 1600, height: 962 };
    assert.equal(projectSchema.safeParse({ ...minimalProject, gallery: [image] }).success, true);
    assert.equal(projectSchema.safeParse({ ...minimalProject, gallery: [{ ...image, alt: ' ' }] }).success, false);
    assert.equal(projectSchema.safeParse({ ...minimalProject, gallery: [{ ...image, width: 0 }] }).success, false);
  });

  it('accepts YouTube/HTTPS/local video and rejects a missing local video file', () => {
    const video = (src: string) => ({ ...minimalProject, media: [{ type: 'video', src, title: 'Demo' }] });
    assert.equal(projectSchema.safeParse(video('https://youtu.be/abc')).success, true);
    assert.equal(projectSchema.safeParse(video('/projects/missing/demo.mp4')).success, false);
  });

  it('coerces SQL result cells and rejects rows that do not match the columns', () => {
    const table = (rows: unknown[][]) => ({
      ...minimalProject,
      results: [{ type: 'table', title: 'T', columns: ['a', 'b', 'c', 'd'], rows }],
    });
    const parsed = projectSchema.parse(table([['x', 31, new Date('2026-01-02T00:00:00Z'), null]]));
    const result = parsed.results[0];
    assert.ok(result && result.type === 'table');
    assert.deepEqual(result.rows[0], ['x', '31', '2026-01-02', 'NULL']);
    const bad = projectSchema.safeParse(table([['only one cell']]));
    assert.equal(bad.success, false);
    assert.match(bad.error?.issues[0]?.message ?? '', /Expected 4 cells/);
  });
});

describe('blog publication', () => {
  const now = new Date('2026-10-15T12:00:00Z');
  const post = (extra: Record<string, unknown>) =>
    blogSchema.parse({ title: 'T', description: 'D', publishedAt: '2026-10-01', ...extra });

  it('publishes non-draft posts whose date has arrived', () => {
    assert.equal(isPublishedBlogData(post({}), now), true);
    assert.equal(isPublishedBlogData(post({ publishedAt: '2026-10-15T12:00:00Z' }), now), true);
  });

  it('hides drafts and future-dated posts', () => {
    assert.equal(isPublishedBlogData(post({ draft: true }), now), false);
    assert.equal(isPublishedBlogData(post({ publishedAt: '2026-10-16' }), now), false);
  });

  it('rejects updatedAt before publishedAt', () => {
    assert.equal(blogSchema.safeParse({ title: 'T', description: 'D', publishedAt: '2026-10-02', updatedAt: '2026-10-01' }).success, false);
  });
});

describe('filters', () => {
  it('normalizes accents, case and whitespace', () => {
    assert.equal(normalizeText('  Café   SQL '), 'cafe sql');
  });

  it('requires every query word (AND), in any order', () => {
    assert.equal(matchesQuery('PostgreSQL library database', 'database postgres'), true);
    assert.equal(matchesQuery('PostgreSQL library database', 'database python'), false);
    assert.equal(matchesQuery('anything', '   '), true);
  });

  it('matches facets exactly (not by substring) and treats empty as all', () => {
    assert.equal(matchesFacet(['SQL', 'PostgreSQL'], 'sql'), true);
    assert.equal(matchesFacet(['PostgreSQL'], 'SQL'), false);
    assert.equal(matchesFacet(['x'], undefined), true);
  });

  it('builds facet options by frequency then name, de-duplicated', () => {
    assert.deepEqual(facetOptions([['SQL', 'React'], ['sql', 'Python'], ['SQL', 'SQL']]), ['SQL', 'Python', 'React']);
  });
});

describe('format helpers', () => {
  it('counts and pluralizes', () => {
    assert.equal(countWord(4, true), 'Four');
    assert.equal(countWord(14), '14');
    assert.equal(plural(1, 'project', 'projects'), 'project');
    assert.equal(listJoin(['A', 'B', 'C']), 'A, B, and C');
  });
});

describe('integrity helpers', () => {
  it('rejects duplicate ids case-insensitively', () => {
    assert.throws(() => assertUniqueIds(['dragon-go', 'Dragon-Go'], 'projects'), /duplicate slug/);
    assert.doesNotThrow(() => assertUniqueIds(['a', 'b'], 'projects'));
  });

  it('detects a frontmatter slug that collides with another file and ignores _templates', () => {
    const dir = mkdtempSync(join(tmpdir(), 'slug-test-'));
    try {
      mkdirSync(join(dir, 'src/content/projects'), { recursive: true });
      writeFileSync(join(dir, 'src/content/projects/dragon-go.md'), '---\ntitle: A\n---\n');
      writeFileSync(join(dir, 'src/content/projects/_template.md'), '---\nslug: dragon-go\n---\n');
      const cwd = process.cwd();
      process.chdir(dir);
      try {
        assert.doesNotThrow(() => validateContentSourceSlugs('src/content/projects', 'projects'));
        writeFileSync(join(dir, 'src/content/projects/copy.md'), "---\ntitle: B\nslug: 'dragon-go'\n---\n");
        assert.throws(() => validateContentSourceSlugs('src/content/projects', 'projects'), /duplicate slug "dragon-go"/);
      } finally {
        process.chdir(cwd);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects skill groups that point at unknown projects', () => {
    assert.throws(() => assertProjectReferences(['a'], [{ projectSlug: 'b' }]), /does not match a published project/);
  });

  it('validates content links', () => {
    assert.throws(() => validateContentLink('#', 'f'), /placeholder/);
    assert.throws(() => validateContentLink('ftp://x', 'f'), /HTTP\(S\)/);
    assert.equal(validateContentLink('/projects/x', 'f'), '/projects/x');
  });

  it('requires internal links to resolve to a route, published entry, or public file', () => {
    const known = { projects: ['dragon-go'], posts: ['first-post'] };
    assert.doesNotThrow(() => assertInternalLink('/projects/dragon-go', 'f', known));
    assert.doesNotThrow(() => assertInternalLink('/blog/first-post#intro', 'f', known));
    assert.doesNotThrow(() => assertInternalLink('/about', 'f', known));
    assert.doesNotThrow(() => assertInternalLink('/projects/dragon-go/home.webp', 'f', known));
    assert.doesNotThrow(() => assertInternalLink('https://example.com/x', 'f', known));
    assert.throws(() => assertInternalLink('/projects/nope', 'f', known), /published project/);
    assert.throws(() => assertInternalLink('/blog/draft-post', 'f', known), /published blog post/);
    assert.throws(() => assertInternalLink('/resume.pdf', 'f', known), /does not exist/);
  });

  it('keeps public asset paths inside public/', () => {
    assert.throws(() => validatePublicAsset('projects/x.png', 'f'), /must start with "\/"/);
    assert.throws(() => validatePublicAsset('/../package.json', 'f'), /outside public/);
    assert.throws(() => validatePublicAsset('/favicon.svg?v=1', 'f'), /query string/);
    assert.equal(validatePublicAsset('/favicon.svg', 'f'), '/favicon.svg');
  });
});
