import { getCollection, type CollectionEntry } from 'astro:content';
import { skillGroups } from '../config/portfolio';
import { site, type TimelineEntry } from '../config/site';
import { assertInternalLink, assertProjectReferences, assertUniqueIds } from './validation';
import { isPublishedBlogData } from './publication';
import { matchesFacet, matchesQuery } from './filters';

export { isPublishedBlogData } from './publication';

/** Published projects, ordered by `order`. */
export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  assertUniqueIds(all.map((project) => project.id), 'projects');
  assertProjectReferences(
    all.map((project) => project.id),
    skillGroups,
  );
  await assertTimelineLinks(all.map((project) => project.id));
  return all.sort((a, b) => a.data.order - b.data.order);
}

async function assertTimelineLinks(projects: string[]): Promise<void> {
  const posts = (await getPublishedPosts()).map((post) => post.id);
  for (const group of ['education', 'workExperience', 'leadership'] as const) {
    (site[group] as ReadonlyArray<TimelineEntry>).forEach((entry, entryIndex) =>
      entry.evidenceLinks?.forEach((link, linkIndex) =>
        assertInternalLink(link.url, `src/config/site.ts ${group}[${entryIndex}].evidenceLinks[${linkIndex}].url`, { projects, posts }),
      ),
    );
  }
}

export async function getFeaturedProjects(): Promise<CollectionEntry<'projects'>[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.data.featured);
  return featured.length > 0 ? featured : all.slice(0, 2);
}

/**
 * Single public source for posts. Every list, route, search/filter helper,
 * related-content query, RSS entry, sitemap route and OG image starts here.
 */
export function getPublishedPosts(now?: Date): Promise<CollectionEntry<'blog'>[]> {
  // One cutoff per production build, so list, detail routes, RSS, sitemap and OG always agree.
  if (now || !import.meta.env.PROD) return loadPublishedPosts(now ?? new Date());
  return (publishedPostsBuild ??= loadPublishedPosts(new Date()));
}

let publishedPostsBuild: Promise<CollectionEntry<'blog'>[]> | undefined;

async function loadPublishedPosts(now: Date): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog', ({ data }) => isPublishedBlogData(data, now));
  assertUniqueIds(all.map((post) => post.id), 'blog');
  return all.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/** Backward-compatible alias. New consumers should use `getPublishedPosts`. */
export const getPosts = getPublishedPosts;

/** Text the blog search matches against. The browser filter on /blog indexes the same fields. */
export function postSearchText(post: CollectionEntry<'blog'>): string {
  return [post.data.title, post.data.description, ...post.data.tags].join(' ');
}

export async function filterPublishedPosts(options: { query?: string; tag?: string; now?: Date } = {}) {
  const posts = await getPublishedPosts(options.now);
  return posts.filter(
    (post) => matchesFacet(post.data.tags, options.tag) && matchesQuery(postSearchText(post), options.query),
  );
}

/** Text the project search matches against. */
export function projectSearchText(project: CollectionEntry<'projects'>): string {
  const { data } = project;
  return [data.title, data.role, data.tagline, data.summary, data.category ?? '', ...data.technologies].join(' ');
}

export function getRelatedPosts(
  post: CollectionEntry<'blog'>,
  publishedPosts: CollectionEntry<'blog'>[],
  limit = 3,
): CollectionEntry<'blog'>[] {
  const tags = new Set(post.data.tags.map((tag) => tag.toLowerCase()));
  return publishedPosts
    .filter((candidate) => candidate.id !== post.id && candidate.data.tags.some((tag) => tags.has(tag.toLowerCase())))
    .slice(0, limit);
}

/** Reading time from the raw Markdown body (≈220 wpm, minimum 1 minute). */
export function readingTime(body: string | undefined): { minutes: number; words: number } {
  const text = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\-|]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return { minutes: Math.max(1, Math.round(words / 220)), words };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}
