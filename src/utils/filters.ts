/**
 * Pure search/filter rules shared by build-time helpers (`filterPublishedPosts`)
 * and the browser filter UI (`FilterBar.astro`). No Node or Astro imports, so it
 * can be bundled for the client.
 */

/** Lowercase, strip accents and collapse whitespace so "Café  SQL" matches "cafe sql". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every whitespace-separated word of `query` must appear somewhere in `haystack`. */
export function matchesQuery(haystack: string, query: string | undefined): boolean {
  const words = normalizeText(query ?? '').split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const text = normalizeText(haystack);
  return words.every((word) => text.includes(word));
}

/** Facet match: no selection matches everything; otherwise one value must equal the selection. */
export function matchesFacet(values: readonly string[], selected: string | undefined): boolean {
  const wanted = normalizeText(selected ?? '');
  if (!wanted) return true;
  return values.some((value) => normalizeText(value) === wanted);
}

/** Unique values sorted by frequency (desc) then name, for building filter chips from data. */
export function facetOptions(lists: ReadonlyArray<readonly string[]>): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const list of lists) {
    for (const raw of new Set(list.map((v) => v.trim()).filter(Boolean))) {
      const key = normalizeText(raw);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { label: raw, count: 1 });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((entry) => entry.label);
}
