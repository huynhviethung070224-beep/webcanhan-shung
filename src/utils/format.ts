const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** "three" for 3, "14" for 14. Capitalize with `capitalized: true` for sentence starts. */
export function countWord(n: number, capitalized = false): string {
  const word = WORDS[n] ?? String(n);
  return capitalized ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/** "A, B, and C" */
export function listJoin(items: string[]): string {
  return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(items);
}
