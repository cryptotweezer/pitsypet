"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

// Product demo rendered with Remotion (source lives outside this repo, in
// pitsypet_video/). It plays muted in a loop, like a moving screenshot.
// Nothing downloads until the section is near the screen, it only plays while
// mostly visible, and each device gets one file: the vertical cut on narrow
// screens, the wide one elsewhere. Sound is opt-in.
const NARROW = "(max-width: 767px)";

export function DemoVideo() {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [tall, setTall] = useState(false);
  const [near, setNear] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(true);

  const visible = useRef(false);
  const userPaused = useRef(false);
  const reduced = useRef(false);

  const sync = () => {
    const v = video.current;
    if (!v || !v.currentSrc) return;
    if (visible.current && !userPaused.current && !reduced.current) v.play().catch(() => {});
    else v.pause();
  };

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const update = () => setTall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Load when the section gets close; play only while it is mostly on screen.
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    userPaused.current = reduced.current;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) setNear(true);
        visible.current = e.intersectionRatio >= 0.4;
        sync();
      },
      { rootMargin: "300px 0px", threshold: [0, 0.4] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const name = tall ? "demo-9x16" : "demo-16x9";

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) {
      userPaused.current = false;
      void v.play();
    }
  };

  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    userPaused.current = !v.paused;
    if (v.paused) void v.play();
    else v.pause();
  };

  const control =
    "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full bg-brand/80 px-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <div
      ref={box}
      className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand/25 ring-1 ring-brand/10 md:max-w-[min(64rem,calc((100dvh-20rem)*16/9))] md:rounded-[1.75rem]"
    >
      {/* Window chrome on wider screens, so it reads as the app in a browser */}
      <div className="hidden items-center gap-3 border-b border-outline-variant/30 bg-surface-container-low px-5 py-3 md:flex">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto rounded-full bg-white px-4 py-1 text-xs text-on-surface-variant">
          pitsypet.andreshenao.com.au
        </span>
        <span className="w-[52px]" aria-hidden />
      </div>
      <div className="relative aspect-[9/16] md:aspect-video">
        <video
          key={name}
          ref={video}
          className="block size-full cursor-pointer object-cover"
          src={near ? `/video/${name}.mp4` : undefined}
          poster={`/video/${name}.webp`}
          muted
          loop
          playsInline
          preload={near ? "auto" : "none"}
          aria-label="Demo: a PitsyPet assessment from the first message to the results"
          onLoadedData={sync}
          onClick={togglePlay}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
        />
        <div className="absolute right-3 bottom-3 flex gap-2 md:right-4 md:bottom-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={paused ? "Play video" : "Pause video"}
            className={control}
          >
            {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className={control}
          >
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
            <span>{muted ? "Sound on" : "Mute"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
