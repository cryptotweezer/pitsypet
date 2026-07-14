"use client";

import { useEffect, useState } from "react";

// Cut-out pet photos (transparent PNG/WebP) that cross-fade — 2 dogs + 2 cats,
// alternating — anchored to the bottom-right of the hero so the animal "bleeds"
// off the edge like the reference. Only `opacity` animates (GPU-cheap); freezes
// on the first slide when the user prefers reduced motion. Drop the four files
// in /public with these names and they appear automatically; until then each
// <img> hides itself on error so the hero just shows the coloured background.
const SLIDES: { src: string; label: string }[] = [
  { src: "/dog1.png", label: "dog" },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      8000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute right-[5%] bottom-0 z-0 hidden h-[92%] w-[48%] max-w-[690px] lg:block">
      {SLIDES.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt={i === index ? `A happy ${s.label}` : ""}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
