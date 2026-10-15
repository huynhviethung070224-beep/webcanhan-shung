/** Dependency-free helpers for asserting on built HTML/XML artifacts. */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walk } from '../../scripts/ui-fixture/lib.mjs';

export const read = (dist, rel) => readFileSync(join(dist, rel), 'utf8');

export function htmlPages(dist) {
  return walk(dist)
    .filter((file) => file.endsWith('.html'))
    .map((file) => relative(dist, file));
}

/** "/about" for about.html, "/" for index.html. */
export function routeOf(rel) {
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\.html$/, '').replace(/\/index$/, '')}`;
}

/** Resolve a site path the way Vercel cleanUrls does (path, path.html, path/index.html). */
export function resolvesInDist(dist, path) {
  const clean = decodeURIComponent(path.replace(/[?#].*$/, ''));
  if (clean === '/' || clean === '') return existsSync(join(dist, 'index.html'));
  for (const candidate of [clean, `${clean}.html`, join(clean, 'index.html')]) {
    const file = join(dist, candidate);
    if (existsSync(file) && statSync(file).isFile()) return true;
  }
  return false;
}

export const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
export const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
export const meta = (html, key) =>
  tags(html, 'meta')
    .find((t) => attr(t, 'name') === key || attr(t, 'property') === key)
    ?.match(/\scontent="([^"]*)"/)?.[1];
export const canonical = (html) => tags(html, 'link').find((t) => attr(t, 'rel') === 'canonical')?.match(/href="([^"]*)"/)?.[1];

/** Visible text without tags/scripts/styles, whitespace collapsed. */
export function text(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;|’/g, "'")
    .replace(/\s+/g, ' ');
}

/** All href/src/srcset/poster targets in the document. */
export function links(html) {
  const out = [];
  for (const match of html.matchAll(/\s(href|src|poster)="([^"]*)"/g)) out.push({ kind: match[1], url: match[2] });
  for (const match of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    for (const part of match[1].split(',')) out.push({ kind: 'srcset', url: part.trim().split(/\s+/)[0] });
  }
  return out;
}

export const xmlLocs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
