"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal enhancer for the landing page.
 *
 * Progressive enhancement: elements carry the `.reveal` (or `.reveal-fade`)
 * class and are fully visible by default. Only once this mounts do we add
 * `reveal-active` to <html>, which flips un-revealed elements to their hidden
 * start state; an IntersectionObserver then adds `.is-visible` as each scrolls
 * into view (once — we unobserve after). If JS never runs, or the user prefers
 * reduced motion, everything just stays visible.
 *
 * CSP-safe: no inline <style>/<script>; the only inline style is set via the
 * CSSOM (`el.style.animationDelay`), which CSP does not govern. All hidden /
 * animation rules live in globals.css.
 *
 * Because the hero fills the viewport and carries no `.reveal`, every revealed
 * element is below the fold at load — so flipping them hidden on mount produces
 * no visible flash.
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .reveal-fade"),
    );
    if (els.length === 0) return;

    // Respect reduced-motion: leave everything in its default visible state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("reveal-active");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay;
          if (delay) el.style.animationDelay = `${delay}ms`;
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
