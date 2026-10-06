import { getCollection, type CollectionEntry } from 'astro:content';

/** Published projects, ordered by `order`. */
export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProjects(): Promise<CollectionEntry<'projects'>[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.data.featured);
  return featured.length > 0 ? featured : all.slice(0, 2);
}

/** Published posts, newest first. Drafts are excluded everywhere. */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
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
