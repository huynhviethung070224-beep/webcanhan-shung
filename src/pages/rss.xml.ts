import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { getPosts } from '../utils/content';

/**
 * RSS feed of published articles. Returns 404 while there are no posts so the
 * feed is only discoverable once genuine content exists.
 */
export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  if (posts.length === 0) {
    return new Response(null, { status: 404 });
  }
  return rss({
    title: `${site.displayName} — Blog`,
    description: 'Articles about learning, data, software, project decisions, and internship reflections.',
    site: context.site ?? site.productionOrigin,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
    })),
  });
};
