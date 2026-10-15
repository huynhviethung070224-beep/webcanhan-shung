/**
 * One-time section reveals. Content is fully visible without JS; with JS the
 * `.reveal` elements fade/slide in once as they enter the viewport.
 * Respects prefers-reduced-motion by revealing everything immediately.
 * A CSS animation in global.css also reveals everything if this never runs.
 */
import { onPageReady } from './lifecycle';

onPageReady(() => {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'));
  if (items.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

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
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.classList.add('is-visible');
    } else {
      io.observe(el);
    }
  });

  // Safety net: never leave content hidden.
  const timer = window.setTimeout(() => items.forEach((el) => el.classList.add('is-visible')), 2500);

  return () => {
    io.disconnect();
    window.clearTimeout(timer);
  };
});
