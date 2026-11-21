"use client";

// 3D coverflow adapted from 21st.dev "Glassy Coverflow Carousel" (automate_flows), restyled to the site tokens.
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { LuPause, LuPlay } from "react-icons/lu";
import { SiInstagram } from "react-icons/si";
import { GlassArrow } from "./GlassArrow";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type Reel = { id: string; url: string; alt: string; href: string };

const AUTOPLAY_MS = 4500;
const wrap = (value: number, length: number) => ((value % length) + length) % length;

export function ReelsCoverflow({ reels, label }: { reels: Reel[]; label: string }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 1100, height: 496 });
  const stage = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; time: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const focusActive = useRef(false);

  const n = reels.length;
  const activeIndex = n ? wrap(index, n) : 0;
  const active = reels[activeIndex];
  const cardWidth = Math.round(Math.min(300, stageSize.width * 0.62, (stageSize.height - 24) / 1.25 - 12));
  const step = cardWidth * 0.78;
  const before = Math.min(2, Math.floor((n - 1) / 2));
  const after = Math.min(2, Math.ceil((n - 1) / 2));
  // Off-stage virtual slots recycle invisibly instead of sweeping across the deck at the wrap point.
  const slots = n > 1 ? Array.from({ length: before + after + 3 }, (_, p) => index + p - before - 1) : [index];
  const running = playing && !reduced && !dragging && !hovered && !focused && pageVisible && n > 1;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setStageSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // The story-bar fill *is* the autoplay clock: when the current segment finishes filling, the next reel shows.
  const fillRef = useRef<HTMLSpanElement>(null);
  const fillAnim = useRef<Animation | null>(null);
  useEffect(() => {
    const el = fillRef.current;
    if (!el || reduced || n < 2) return;
    const anim = el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: AUTOPLAY_MS,
      easing: "linear",
      fill: "forwards",
    });
    anim.onfinish = () => setIndex((i) => i + 1);
    fillAnim.current = anim;
    return () => {
      anim.onfinish = null;
      anim.cancel();
      fillAnim.current = null;
    };
  }, [index, reduced, n]);

  useEffect(() => {
    const anim = fillAnim.current;
    if (!anim) return;
    if (running) anim.play();
    else anim.pause();
  }, [running, index]);

  useEffect(() => {
    if (!focusActive.current) return;
    focusActive.current = false;
    stage.current?.querySelector<HTMLElement>("[data-active-card]")?.focus({ preventScroll: true });
  }, [index]);

  if (!active) return null;

  const select = (next: number) => {
    setIndex(next);
    setDrag(0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1),
      ArrowLeft: () => select(index - 1),
      Home: () => select(index - activeIndex),
      End: () => select(index - activeIndex + n - 1),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    focusActive.current = (event.target as HTMLElement).closest("[data-card]") !== null;
    action();
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    gesture.current = { x: event.clientX, y: event.clientY, time: event.timeStamp, horizontal: false };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      gesture.current = null;
      return;
    }
    if (!start.horizontal && Math.abs(dx) > 8) {
      start.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    if (start.horizontal) setDrag(Math.max(-1.2, Math.min(1.2, dx / step)));
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = gesture.current;
    gesture.current = null;
    if (start?.horizontal) {
      const dx = event.clientX - start.x;
      const velocity = Math.abs(dx) / Math.max(1, event.timeStamp - start.time);
      const far = Math.abs(dx) > Math.min(55, cardWidth * 0.18);
      if (!cancel && (far || (Math.abs(dx) > 14 && velocity > 0.35))) setIndex((i) => i + (dx < 0 ? 1 : -1));
      suppressClickUntil.current = event.timeStamp + 300;
    }
    setDrag(0);
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const blockClickAfterDrag = (event: MouseEvent) => {
    if (event.timeStamp < suppressClickUntil.current) {
      event.preventDefault();
      return true;
    }
    return false;
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown} className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, var(--color-terracotta-100), color-mix(in srgb, var(--color-sand-100) 0%, transparent) 70%)",
        }}
      />

      {/* Instagram-Stories progress: one segment per reel; tapping a segment jumps there. */}
      <div className="mx-auto mb-5 flex max-w-[24rem] items-center gap-3 px-2">
        <div role="group" aria-label="Choose a reel" className="flex flex-1 items-center gap-1.5">
          {reels.map((reel, k) => {
            const state = k < activeIndex ? "done" : k === activeIndex ? "current" : "todo";
            return (
              <button
                key={reel.id}
                type="button"
                aria-label={`Show reel ${k + 1} of ${n}`}
                aria-current={state === "current" || undefined}
                onClick={() => select(index - activeIndex + k)}
                className="group/seg flex h-6 flex-1 items-center rounded-pill"
              >
                <span className="relative h-1 w-full overflow-hidden rounded-pill bg-sea-900/15 transition-[height] duration-200 group-hover/seg:h-1.5">
                  {state === "done" ? <span className="absolute inset-0 rounded-pill bg-sea-700" /> : null}
                  {state === "current" ? (
                    <span
                      key={index}
                      ref={fillRef}
                      className="absolute inset-0 origin-left rounded-pill bg-terracotta-500"
                      style={reduced || n < 2 ? undefined : { transform: "scaleX(0)" }}
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label={playing ? "Pause reels" : "Play reels"}
          aria-pressed={playing}
          onClick={() => setPlaying((p) => !p)}
          disabled={reduced || n < 2}
          className="grid size-11 shrink-0 place-items-center rounded-pill text-sea-800 transition-colors duration-200 hover:bg-sea-700 hover:text-sand-50 disabled:opacity-40"
        >
          {playing && !reduced ? <LuPause size={16} aria-hidden /> : <LuPlay size={16} aria-hidden className="translate-x-px" />}
        </button>
      </div>

      <div className="relative">
      <div
        ref={stage}
        data-dragging={dragging || undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={(e) => pointerUp(e)}
        onPointerCancel={(e) => pointerUp(e, true)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        className="relative h-[23rem] cursor-grab touch-pan-y select-none overflow-x-clip [perspective:1100px] [transform-style:preserve-3d] data-[dragging]:cursor-grabbing md:h-[27rem]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-1/2 h-8 w-[min(34rem,80%)] -translate-x-1/2 rounded-[50%] bg-sea-900/30 blur-xl"
        />
        {slots.map((slot) => {
          const reel = reels[wrap(slot, n)];
          const d = slot - index;
          const offset = d + drag;
          const abs = Math.abs(offset);
          const selected = slot === index;
          const offstage = d < -before || d > after;
          const style: CSSProperties = {
            width: cardWidth,
            transform: `translate(-50%, -50%) translate3d(${offset * step}px, 0, ${-Math.min(abs, 3) * 130}px) rotateY(${-Math.max(-42, Math.min(42, offset * 30))}deg) scale(${1 - Math.min(abs, 3) * 0.08})`,
            opacity: offstage ? 0 : 1,
            zIndex: 10 - Math.abs(d),
            pointerEvents: offstage ? "none" : undefined,
          };
          const card = <ReelCard reel={reel} selected={selected} shade={Math.min(abs, 2) * 0.22} eager={Math.abs(d) < 2} />;

          return (
            <div
              key={slot}
              style={style}
              aria-hidden={offstage || undefined}
              className={`absolute left-1/2 top-1/2 [backface-visibility:hidden] motion-safe:transition-[transform,opacity] motion-safe:duration-700 motion-safe:ease-out-soft ${dragging ? "!transition-none" : ""}`}
            >
              {selected ? (
                <a
                  href={reel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  data-card=""
                  data-active-card=""
                  aria-label={`Watch on Instagram: ${reel.alt} (opens in a new tab)`}
                  aria-current="true"
                  onClick={blockClickAfterDrag}
                  className="group block rounded-xl"
                >
                  {card}
                </a>
              ) : (
                <button
                  type="button"
                  tabIndex={-1}
                  data-card=""
                  aria-label={`Show reel: ${reel.alt}`}
                  onClick={(e) => {
                    if (!blockClickAfterDrag(e)) select(slot);
                  }}
                  className="group block w-full rounded-xl text-start"
                >
                  {card}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {n > 1 ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-0 sm:px-2 lg:px-[8%]">
          <GlassArrow dir="prev" label="Previous reel" onClick={() => select(index - 1)} />
          <GlassArrow dir="next" label="Next reel" onClick={() => select(index + 1)} />
        </div>
      ) : null}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {!running ? `${active.alt}. Reel ${activeIndex + 1} of ${n}.` : ""}
      </p>
    </div>
  );
}

function ReelCard({ reel, selected, shade, eager }: { reel: Reel; selected: boolean; shade: number; eager: boolean }) {
  return (
    <span
      className={`block rounded-xl border border-line bg-surface-card p-1.5 transition-shadow duration-300 ${
        selected ? "shadow-lift" : "shadow-card"
      }`}
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-sea-900">
        <Image
          src={reel.url}
          alt=""
          fill
          sizes="(min-width: 768px) 300px, 62vw"
          loading={eager ? "eager" : "lazy"}
          draggable={false}
          className="pointer-events-none object-cover"
        />
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-sea-950/80 via-sea-950/10 to-transparent" />
        <span
          aria-hidden
          className="absolute inset-0 bg-sea-950 transition-opacity duration-500"
          style={{ opacity: shade }}
        />
        <SiInstagram aria-hidden size={18} className="absolute right-3 top-3 text-white drop-shadow" />
        <span
          aria-hidden
          className={`absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill shadow-soft transition-[background-color,transform] duration-200 ease-out-soft ${
            selected
              ? "bg-surface-card/95 text-ink group-hover:scale-110 group-hover:bg-terracotta-500 group-hover:text-ink-deep"
              : "bg-surface-card/70 text-ink/80"
          }`}
        >
          <LuPlay size={22} className="translate-x-0.5" />
        </span>
        <span
          aria-hidden
          className={`absolute inset-x-3.5 bottom-3.5 line-clamp-2 text-sm font-semibold leading-snug text-white transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0"
          }`}
        >
          {reel.alt || "Watch on Instagram"}
        </span>
      </span>
    </span>
  );
}
