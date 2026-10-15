/**
 * Clipboard write that always settles.
 *
 * `navigator.clipboard.writeText` can reject (permission denied, insecure
 * context, unfocused document) or, in some embedded browsers, never settle.
 * A pending promise looks like a dead button, so it is raced against a timeout
 * and followed by the legacy `execCommand('copy')` path. Callers show a manual
 * selection fallback when this resolves `false`.
 */
const CLIPBOARD_TIMEOUT_MS = 1500;

function legacyCopy(text: string): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  area.style.pointerEvents = 'none';
  const previous = document.activeElement as HTMLElement | null;
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  previous?.focus({ preventScroll: true });
  return ok;
}

export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      const result = await Promise.race([
        navigator.clipboard.writeText(text).then(() => true),
        new Promise<false>((resolve) => window.setTimeout(() => resolve(false), CLIPBOARD_TIMEOUT_MS)),
      ]);
      if (result) return true;
    } catch {
      // Fall through to the legacy path.
    }
  }
  return legacyCopy(text);
}

/** Shortcut label for manual copy instructions. */
export function copyShortcut(): string {
  return /Mac|iPhone|iPad/i.test(navigator.userAgent) ? '⌘C' : 'Ctrl+C';
}
