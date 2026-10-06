/**
 * Progressive enhancements for rendered Markdown:
 * - copy-code button on every <pre> with success feedback
 * - horizontal-scroll wrapper for tables
 * - lightbox opt-in for images with intrinsic size larger than their box
 */
const root = document.querySelector<HTMLElement>('.prose');

if (root) {
  // Copy code
  root.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 2h11a1 1 0 0 1 1 1v13h-2V4H8V2ZM4 6h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1 2v12h9V8H5Z"/></svg><span>Copy</span>`;
    const label = btn.querySelector('span')!;
    let timer: number | undefined;
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        btn.classList.add('is-done');
        label.textContent = 'Copied';
      } catch {
        label.textContent = 'Select to copy';
        const range = document.createRange();
        range.selectNodeContents(pre.querySelector('code') ?? pre);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        btn.classList.remove('is-done');
        label.textContent = 'Copy';
      }, 2000);
    });
    pre.appendChild(btn);
  });

  // Table wrappers
  root.querySelectorAll<HTMLTableElement>('table').forEach((table) => {
    if (table.parentElement?.classList.contains('table-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    table.replaceWith(wrap);
    wrap.appendChild(table);
  });
}
