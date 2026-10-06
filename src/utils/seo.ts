import { site } from '../config/site';

/** Compose the document title. Home uses the bare identity. */
export function pageTitle(title?: string): string {
  const brand = site.displayName;
  if (!title) return `${brand} — ${site.tagline}`;
  return `${title} — ${brand}`;
}

/**
 * Clean route path: strips the `.html` suffix produced by `build.format: 'file'`
 * and any trailing slash, so `/about.html` and `/about/` both become `/about`.
 */
export function normalizePath(pathname: string): string {
  let path = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (path.length > 1) path = path.replace(/\/$/, '');
  return path || '/';
}

/** Absolute URL against the resolved site origin (Astro.site). */
export function absoluteUrl(path: string, origin: URL | undefined): string {
  const base = origin?.toString() ?? `${site.productionOrigin}/`;
  const clean = path.startsWith('/') && !path.startsWith('/og/') ? normalizePath(path) : path;
  return new URL(clean, base).toString();
}

/** Path of the generated Open Graph image for a route. */
export function ogImagePath(key: string): string {
  return `/og/${key}.png`;
}
