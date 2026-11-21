"use client";

import { useEffect, useRef, useState } from "react";
import { PiPlayFill } from "react-icons/pi";

const LABEL =
  "Promo clip: a helicopter carries a Sea Soul Sandadi banner reading Venue: MGM Lawns, next to Light House, Visakhapatnam, over the night beach market";

export function VenueVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [userPlay, setUserPlay] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const autoplay = !reduced || userPlay;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!autoplay) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [autoplay]);

  return (
    <figure className="relative mx-auto w-full max-w-[22rem] rounded-xl bg-sea-700 p-2 shadow-lift ring-1 ring-sea-600">
      <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-sea-950">
        <video
          ref={ref}
          className="absolute inset-0 size-full object-cover"
          poster="/seed/video/venue-poster.webp"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={LABEL}
        >
          <source src="/seed/video/venue.webm" type="video/webm" />
          <source src="/seed/video/venue.mp4" type="video/mp4" />
        </video>
        {!autoplay ? (
          <button
            type="button"
            onClick={() => setUserPlay(true)}
            className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-pill bg-sand-50/90 text-sea-900 shadow-soft"
          >
            <PiPlayFill aria-hidden="true" className="size-7" />
            <span className="sr-only">Play the venue clip</span>
          </button>
        ) : null}
      </div>
      <figcaption className="px-2 pt-3 pb-1 font-display text-sm uppercase tracking-wider text-sand-100">
        Venue · MGM Lawns
      </figcaption>
    </figure>
  );
}
