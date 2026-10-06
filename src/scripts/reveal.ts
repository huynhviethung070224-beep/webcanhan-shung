/**
 * One-time section reveals. Content is fully visible without JS; with JS the
 * `.reveal` elements fade/slide in once as they enter the viewport.
 * Respects prefers-reduced-motion by revealing everything immediately.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

if (reduced || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  items.forEach((el) => {
    // Elements already in view on load reveal immediately to avoid a blank first screen.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('is-visible');
    } else {
      io.observe(el);
    }
  });
}

// Safety net: never leave content hidden.
window.setTimeout(() => items.forEach((el) => el.classList.add('is-visible')), 2500);
