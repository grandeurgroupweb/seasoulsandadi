"use client";

import type { EmblaCarouselType } from "embla-carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useMemo, useRef, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { GlassArrow } from "./GlassArrow";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  label: string;
  slides: ReactNode[];
  speed: number;
  direction?: "forward" | "backward";
  /** Repeat slides until at least this many exist, so the loop never runs out on wide screens. */
  minSlides?: number;
  slideClassName?: string;
  controls?: { prev: string; next: string } | null;
};

const RESUME_DELAY_MS = 2000;

export function AutoScrollCarousel({
  label,
  slides,
  speed,
  direction = "forward",
  minSlides = 0,
  slideClassName = "",
  controls = null,
}: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedByUser = useRef(false);

  const plugins = useMemo(
    () =>
      reduceMotion
        ? []
        : [
            AutoScroll({
              speed,
              direction,
              startDelay: RESUME_DELAY_MS,
              stopOnInteraction: false,
              stopOnFocusIn: true,
              // Touch browsers fire a compat mouseenter on tap, which would pause until the next tap elsewhere.
              stopOnMouseEnter: false,
              breakpoints: { "(hover: hover) and (pointer: fine)": { stopOnMouseEnter: true } },
              // Hovering the arrow buttons should pause too, so watch the whole carousel, not just the viewport.
              rootNode: (emblaRoot) => emblaRoot.closest<HTMLElement>("[data-carousel-root]") ?? emblaRoot,
            }),
          ],
    [reduceMotion, speed, direction],
  );

  const [viewportRef, api] = useEmblaCarousel({ loop: true, dragFree: true, align: "start" }, plugins);

  const total = slides.length;
  const copies = total > 0 && minSlides > total ? Math.ceil(minSlides / total) : 1;

  const resumeAfterSettle = useCallback((emblaApi: EmblaCarouselType) => {
    const onSettle = () => {
      emblaApi.off("settle", onSettle);
      if (!pausedByUser.current) emblaApi.plugins().autoScroll?.play(RESUME_DELAY_MS);
    };
    emblaApi.on("settle", onSettle);
  }, []);

  const step = useCallback(
    (dir: "prev" | "next") => {
      if (!api) return;
      const autoScroll = api.plugins().autoScroll;
      if (autoScroll?.isPlaying()) autoScroll.stop();
      if (dir === "prev") api.scrollPrev();
      else api.scrollNext();
      if (autoScroll) resumeAfterSettle(api);
    },
    [api, resumeAfterSettle],
  );

  // Buttons sit outside Embla's container, so keyboard focus on them needs its own pause/resume.
  // Taps also focus buttons but aren't :focus-visible, so they don't pause.
  const onFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).matches(":focus-visible")) return;
    pausedByUser.current = true;
    api?.plugins().autoScroll?.stop();
  };
  const onBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    if (!pausedByUser.current) return;
    pausedByUser.current = false;
    api?.plugins().autoScroll?.play(RESUME_DELAY_MS);
  };
  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") pausedByUser.current = true;
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") pausedByUser.current = false;
  };

  return (
    <div
      ref={rootRef}
      data-carousel-root=""
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      <div
        ref={viewportRef}
        className="-my-6 cursor-grab overflow-hidden active:cursor-grabbing"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 9%, black 91%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 9%, black 91%, transparent)",
        }}
      >
        {/* Spacing via slide padding, not CSS gap: Embla's loop math ignores gap, which closes the seam.
            Vertical padding leaves room for the hover lift and its shadow inside the clipped viewport. */}
        <div className="-ml-4 flex touch-pan-y py-8 md:-ml-5">
          {Array.from({ length: copies }, (_, copy) =>
            slides.map((slide, i) => {
              const isCopy = copy > 0;
              return (
                <div
                  key={`${copy}-${i}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${total}`}
                  aria-hidden={isCopy || undefined}
                  inert={isCopy || undefined}
                  className={`min-w-0 shrink-0 grow-0 pl-4 md:pl-5 ${slideClassName}`}
                >
                  {slide}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {controls ? (
        <div className="relative z-10 mt-6 flex justify-center gap-3 md:pointer-events-none md:absolute md:inset-x-0 md:top-1/2 md:mt-0 md:-translate-y-1/2 md:justify-between md:px-4">
          <GlassArrow dir="prev" label={controls.prev} onClick={() => step("prev")} />
          <GlassArrow dir="next" label={controls.next} onClick={() => step("next")} />
        </div>
      ) : null}
    </div>
  );
}
