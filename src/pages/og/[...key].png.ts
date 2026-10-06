import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '../../config/site';
import { getPosts, getProjects } from '../../utils/content';
import { renderOgImage, type OgInput } from '../../utils/og';

/**
 * Pre-rendered Open Graph images: /og/<key>.png
 * Keys mirror routes: home, about, portfolio, projects, blog, contact,
 * projects/<slug>, blog/<slug>. Drafts are never included.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const staticPages: Record<string, OgInput> = {
    home: { kind: 'Portfolio', title: site.displayName, subtitle: site.tagline },
    about: { kind: 'About Me', title: 'The person behind the work.', subtitle: site.tagline },
    portfolio: { kind: 'Portfolio', title: 'A quick professional overview.', subtitle: site.tagline },
    projects: { kind: 'Projects', title: 'Products and technical case studies.', subtitle: site.tagline },
    blog: { kind: 'Blog', title: 'Notes on learning, data, and software.', subtitle: site.tagline },
    contact: { kind: 'Contact', title: 'Connect with me.', subtitle: site.tagline },
  };

  const paths = Object.entries(staticPages).map(([key, input]) => ({ params: { key }, props: { input } }));

  for (const project of await getProjects()) {
    paths.push({
      params: { key: `projects/${project.id}` },
      props: { input: { kind: 'Project', title: project.data.title, subtitle: project.data.role } },
    });
  }

  for (const post of await getPosts()) {
    paths.push({
      params: { key: `blog/${post.id}` },
      props: { input: { kind: 'Article', title: post.data.title, subtitle: post.data.description } },
    });
  }

  return paths;
};

export const GET: APIRoute<{ input: OgInput }> = async ({ props }) => {
  const png = await renderOgImage(props.input);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
