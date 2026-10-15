import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

/**
 * Validate a configured file served from `public/`.
 *
 * Optional assets should skip this helper entirely. Once a path is configured,
 * it must be absolute-from-site-root and point to a real file so the site never
 * publishes a broken local link.
 */
export function validatePublicAsset(src: string, field: string): string {
  if (!src.startsWith('/') || src.startsWith('//')) {
    throw new Error(`${field}: "${src}" must start with "/" and resolve inside public/.`);
  }
  if (src.includes('?') || src.includes('#')) {
    throw new Error(`${field}: "${src}" must not include a query string or fragment.`);
  }

  const publicRoot = resolve(process.cwd(), 'public');
  const filePath = resolve(publicRoot, `.${src}`);
  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${sep}`)) {
    throw new Error(`${field}: "${src}" resolves outside public/.`);
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error(`${field}: "${src}" does not exist. Add the file at ${filePath} or remove the optional field.`);
  }
  return src;
}

export function validateOptionalPublicAsset(src: string | undefined, field: string): void {
  if (src) validatePublicAsset(src, field);
}

export function validateContentLink(url: string, field: string): string {
  if (url === '#' || !url.trim()) {
    throw new Error(`${field}: placeholder or empty URLs are not allowed.`);
  }
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('unsupported protocol');
  } catch {
    throw new Error(`${field}: "${url}" must be an internal /path or a valid HTTP(S) URL.`);
  }
  return url;
}

export function assertUniqueIds(ids: string[], collection: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    const normalized = id.toLowerCase();
    if (seen.has(normalized)) {
      throw new Error(`${collection}: duplicate slug "${id}". Slugs must be unique, including letter case.`);
    }
    seen.add(normalized);
  }
}

/** Check source names before Astro loads them, so case-only duplicate slugs cannot be overwritten silently. */
export function validateContentSourceSlugs(directory: string, collection: string): void {
  const root = resolve(process.cwd(), directory);
  if (!existsSync(root)) return;
  const files = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_'))
    .map((entry) => resolve(entry.parentPath, entry.name));
  const bySlug = new Map<string, string>();

  for (const file of files) {
    // Astro's glob loader lets a frontmatter `slug:` replace the file name, and a clash silently overwrites an entry.
    const slug = frontmatterSlug(readFileSync(file, 'utf8')) ?? relative(root, file).replace(/\.md$/i, '').split(sep).join('/');
    const normalized = slug.toLowerCase();
    const existing = bySlug.get(normalized);
    if (existing) {
      throw new Error(`${collection}: duplicate slug "${slug}" in ${existing} and ${file}.`);
    }
    bySlug.set(normalized, file);
  }
}

function frontmatterSlug(source: string): string | undefined {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1];
  const value = block && /^slug:\s*(.+)$/m.exec(block)?.[1];
  return value ? value.trim().replace(/^['"]|['"]$/g, '') : undefined;
}

/** Static routes that internal content links may point to (besides project/blog detail pages and public files). */
export const STATIC_ROUTES = ['/', '/about', '/portfolio', '/projects', '/blog', '/contact'];

/**
 * Internal content links must resolve: `/projects/<slug>` and `/blog/<slug>` to a
 * published entry, other paths to a static route or an existing file in `public/`.
 */
export function assertInternalLink(
  url: string,
  field: string,
  known: { projects: ReadonlyArray<string>; posts: ReadonlyArray<string> },
): void {
  if (!url.startsWith('/') || url.startsWith('//')) return;
  const path = url.replace(/[?#].*$/, '').replace(/\/$/, '') || '/';
  const detail = /^\/(projects|blog)\/([^/]+)$/.exec(path);
  if (detail) {
    const ids = detail[1] === 'projects' ? known.projects : known.posts;
    if (!ids.includes(detail[2]!)) {
      throw new Error(`${field}: "${url}" does not match a published ${detail[1] === 'projects' ? 'project' : 'blog post'}.`);
    }
    return;
  }
  if (STATIC_ROUTES.includes(path)) return;
  validatePublicAsset(path, field);
}

export function assertProjectReferences(
  projectIds: string[],
  references: ReadonlyArray<{ projectSlug: string }>,
): void {
  const known = new Set(projectIds);
  for (const reference of references) {
    if (!known.has(reference.projectSlug)) {
      throw new Error(
        `src/config/portfolio.ts skillGroups.projectSlug: "${reference.projectSlug}" does not match a published project.`,
      );
    }
  }
}
