/**
 * Progressive enhancements for rendered Markdown:
 * - copy-code button on every <pre> with visible + announced feedback
 * - focusable horizontal-scroll wrapper for tables
 * Markdown stays fully readable without this script.
 */
import { bindOnce, onPageReady } from './lifecycle';
import { copyShortcut, copyText } from './clipboard';

const COPY_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 2h11a1 1 0 0 1 1 1v13h-2V4H8V2ZM4 6h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1 2v12h9V8H5Z"/></svg>';

const timers = new WeakMap<HTMLElement, number>();

function announce(message: string) {
  let region = document.querySelector<HTMLElement>('[data-prose-status]');
  if (!region) {
    region = document.createElement('p');
    region.className = 'visually-hidden';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.dataset.proseStatus = '';
    document.body.appendChild(region);
  }
  region.textContent = '';
  window.setTimeout(() => {
    if (region) region.textContent = message;
  }, 30);
}

async function copyCode(btn: HTMLButtonElement) {
  const pre = btn.closest('pre');
  if (!pre) return;
  const code = pre.querySelector('code') ?? pre;
  const label = btn.querySelector('span');
  const ok = await copyText(code.textContent ?? '');
  window.clearTimeout(timers.get(btn));
  if (ok) {
    btn.classList.add('is-done');
    if (label) label.textContent = 'Copied';
    announce('Code copied to clipboard.');
  } else {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    if (label) label.textContent = `Press ${copyShortcut()}`;
    announce(`Copy is blocked here. The code is selected; press ${copyShortcut()} to copy it.`);
  }
  timers.set(
    btn,
    window.setTimeout(() => {
      btn.classList.remove('is-done');
      if (label) label.textContent = 'Copy';
    }, 2200),
  );
}

bindOnce('code-copy', () => {
  document.addEventListener('click', (event) => {
    const btn = (event.target as Element | null)?.closest<HTMLButtonElement>('.code-copy');
    if (btn) void copyCode(btn);
  });
});

onPageReady(() => {
  document.querySelectorAll<HTMLElement>('.prose').forEach((root) => {
    root.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
      if (pre.querySelector('.code-copy')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      const lang = pre.dataset.language;
      btn.setAttribute('aria-label', lang && lang !== 'plaintext' ? `Copy ${lang} code` : 'Copy code');
      btn.innerHTML = `${COPY_ICON}<span>Copy</span>`;
      pre.appendChild(btn);
    });

    root.querySelectorAll<HTMLTableElement>('table').forEach((table) => {
      if (table.parentElement?.classList.contains('table-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', table.querySelector('caption')?.textContent?.trim() || 'Scrollable table');
      table.replaceWith(wrap);
      wrap.appendChild(table);
    });
  });

  document.querySelectorAll<HTMLElement>('.code-copy.is-done').forEach((btn) => {
    btn.classList.remove('is-done');
    const label = btn.querySelector('span');
    if (label) label.textContent = 'Copy';
  });
});
