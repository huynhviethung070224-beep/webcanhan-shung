/**
 * Page lifecycle for progressive enhancements.
 *
 * Navigation today is a full document load (with a native cross-document view
 * transition), but pages can also come back from the back/forward cache, and
 * Astro's <ClientRouter /> may be enabled later. `onPageReady` covers all three:
 * - initial load
 * - `pageshow` with `persisted` (bfcache restore; DOM and listeners survive, state may be stale)
 * - `astro:page-load` (client-side navigation, if ever enabled)
 *
 * Setup functions must be idempotent: mark processed elements (e.g. `data-*-ready`)
 * or bind delegated listeners once with `bindOnce`. A setup can return a cleanup
 * function, which runs before the next setup and on `astro:before-swap`.
 */

type Cleanup = () => void;
type Setup = (context: { restored: boolean }) => void | Cleanup;

const bound = new Set<string>();

/** Run `bind` at most once per document, keyed by `key`. Use for delegated document listeners. */
export function bindOnce(key: string, bind: () => void): void {
  const marker = `__ian_${key}`;
  const globalState = window as unknown as Record<string, boolean>;
  if (bound.has(key) || globalState[marker]) return;
  bound.add(key);
  globalState[marker] = true;
  bind();
}

export function onPageReady(setup: Setup): void {
  let cleanup: Cleanup | void;

  const run = (restored: boolean) => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = setup({ restored });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => run(false), { once: true });
  } else {
    run(false);
  }

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) run(true);
  });
  document.addEventListener('astro:page-load', () => run(false));
  document.addEventListener('astro:before-swap', () => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = undefined;
  });
}
