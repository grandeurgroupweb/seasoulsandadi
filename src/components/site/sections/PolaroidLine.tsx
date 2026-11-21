"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";

// Adapted from 21st.dev "Hanging Polaroid Image Carousel" (kedhareswer/polaroid-line-carousel):
// prints pegged to a sagging string, dragged along it and swinging with the speed you give them.

export type PolaroidSlide = {
  src: string;
  alt: string;
  /** Short handwritten label under the photo. */
  note: string;
  /** Longer line shown in the caption bar for the centred print. */
  caption: string;
};

type Props = {
  slides: PolaroidSlide[];
  label: string;
  /** ms per print; 0 turns autoplay off. */
  autoplay?: number;
  className?: string;
};

const SAG = 42;
const MAX_CARD = 250;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function stringY(x: number, w: number, y0: number, sag: number) {
  const t = clamp(x / w, 0, 1);
  return y0 + 4 * sag * t * (1 - t);
}

// Critically damped spring toward target.
function springStep(x: number, v: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k);
  const nv = v + (k * (target - x) - c * v) * dt;
  return [x + nv * dt, nv];
}

// A print lags behind the line's motion, is pulled back by gravity and damped.
function swingStep(a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt;
  return [clamp(a + nw * dt, -0.6, 0.6), nw];
}

const nearestAt = (off: number, spacing: number, n: number) => clamp(Math.round(off / spacing), 0, Math.max(0, n - 1));
const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

type Drag = { x: number; off: number; lx: number; lt: number; v: number; moved: boolean };

export function PolaroidLine({ slides, label, autoplay = 5000, className = "" }: Props) {
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ w: 1200, h: 520, cw: 220 });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const sim = useRef({ off: 0, vel: 0, target: 0, a: [] as number[], w: [] as number[] });
  const drag = useRef<Drag | null>(null);
  const lastTouch = useRef(0);
  const hovering = useRef(false);
  const activeRef = useRef(0);
  const reduceMotion = useReducedMotion();

  const spacing = size.cw * 1.12;

  const goTo = useCallback(
    (i: number) => {
      sim.current.target = clamp(i, 0, n - 1) * spacing;
    },
    [n, spacing],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect();
      const share = r.width < 640 ? 0.52 : 0.42;
      const cw = Math.round(Math.max(140, Math.min(MAX_CARD, r.width * share, r.height * 0.44)));
      setSize({ w: r.width, h: r.height, cw });
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    sim.current.target = activeRef.current * spacing;
    sim.current.off = activeRef.current * spacing;
  }, [spacing]);

  // The simulation writes transforms straight to the DOM each frame.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let raf = 0;
    let prev = performance.now();
    const S = sim.current;

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const { w, h, cw } = size;
      const y0 = Math.max(28, h * 0.08);
      const d = drag.current;
      let lineVel: number;
      if (d && d.moved) {
        lineVel = d.v * 1000;
      } else {
        const before = S.off;
        if (reduce) {
          S.off = S.target;
          S.vel = 0;
        } else {
          [S.off, S.vel] = springStep(S.off, S.vel, S.target, dt);
        }
        lineVel = -(S.off - before) / Math.max(dt, 1e-3);
      }
      const gain = reduce ? 0 : 1;
      const near = nearestAt(S.off, spacing, n);
      for (let i = 0; i < n; i++) {
        const el = cards.current[i];
        if (!el) continue;
        const x = w / 2 + i * spacing - S.off;
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          el.style.visibility = "hidden";
          continue;
        }
        el.style.visibility = "visible";
        let a = S.a[i] || 0;
        let av = S.w[i] || 0;
        [a, av] = swingStep(a, av, lineVel, dt, gain);
        if (gain) a += Math.sin(now / 1300 + i * 1.7) * 0.0009;
        S.a[i] = a;
        S.w[i] = av;
        const y = stringY(x, w, y0, SAG) - 6;
        el.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${a.toFixed(4)}rad)`;
        el.style.zIndex = String(i === near ? n + 1 : n - Math.abs(i - near));
      }
      pathRef.current?.setAttribute("d", `M0 ${y0} Q${w / 2} ${y0 + 2 * SAG} ${w} ${y0}`);
      if (near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size, spacing, n]);

  // Autoplay waits while someone is hovering, dragging or has just interacted.
  useEffect(() => {
    if (!autoplay || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (document.hidden || drag.current || hovering.current || performance.now() - lastTouch.current < autoplay) return;
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1);
    }, autoplay);
    return () => window.clearInterval(t);
  }, [autoplay, n, goTo]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-pl-bar]")) return;
    lastTouch.current = performance.now();
    drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
      rootRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const max = (n - 1) * spacing;
    let off = d.off - dx;
    if (off < 0) off *= 0.35;
    if (off > max) off = max + (off - max) * 0.35;
    sim.current.off = off;
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    lastTouch.current = performance.now();
    if (!d) return;
    if (d.moved) {
      setDragging(false);
      sim.current.vel = -d.v * 1000;
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n));
      return;
    }
    const card = (e.target as HTMLElement).closest("[data-i]");
    if (card) goTo(Number(card.getAttribute("data-i")));
  };
  const step = (dir: number) => {
    lastTouch.current = performance.now();
    goTo(clamp(activeRef.current + dir, 0, n - 1));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };

  if (n === 0) return null;
  const current = slides[active];

  return (
    <div
      ref={rootRef}
      className={`relative w-full touch-pan-y select-none overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
      }}
      style={{ ["--pl-cw" as string]: `${size.cw}px` }}
    >
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <path ref={pathRef} fill="none" className="stroke-sand-600" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {slides.map((slide, i) => {
        const on = i === active;
        return (
          <div
            key={slide.src}
            data-i={i}
            ref={(el) => {
              cards.current[i] = el;
            }}
            aria-hidden={on ? undefined : true}
            className="group absolute left-0 top-0 w-(--pl-cw) origin-top will-change-transform"
            data-on={on ? "1" : "0"}
          >
            <div className="mt-2.5 bg-surface-card p-2.5 pb-0 shadow-[0_1px_2px_rgb(0_51_71/0.12),0_22px_36px_-18px_rgb(0_51_71/0.5)] transition-[transform,filter] duration-500 ease-out-soft group-data-[on=0]:scale-90 group-data-[on=0]:saturate-[0.75]">
              <div className="relative aspect-square overflow-hidden bg-sand-200">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1024px) 250px, 180px"
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              </div>
              <p className="flex h-11 items-center justify-center truncate px-1.5 font-serif text-lg italic leading-none text-sea-800">
                {slide.note}
              </p>
            </div>
            {/* clothes-peg clip */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-6 w-2.5 -translate-x-1/2 rounded-[3px] bg-terracotta-600 shadow-[0_2px_3px_rgb(0_51_71/0.3)] after:absolute after:left-1 after:top-2 after:h-2 after:w-0.5 after:rounded-full after:bg-terracotta-900/50"
            />
          </div>
        );
      })}

      <div
        data-pl-bar
        className="absolute inset-x-3 bottom-3 flex cursor-default flex-col items-center gap-1.5 sm:inset-x-8 sm:bottom-5 sm:gap-2.5"
      >
        <motion.p
          key={active}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-full items-baseline gap-2.5 px-2 text-[0.9375rem] text-ink-muted sm:text-base"
        >
          <span className="shrink-0 font-display text-lg tabular-nums tracking-wider text-sea-800">
            <span className="text-terracotta-800">{pad2(active + 1)}</span>/{pad2(n)}
          </span>
          <span className="truncate">{current.caption}</span>
        </motion.p>
        <div className="flex w-full max-w-[34rem] items-center gap-2 sm:gap-4">
          <TagButton dir="prev" label="Previous stall photo" disabled={active === 0} onClick={() => step(-1)} />
          <RopeScrubber
            count={n}
            active={active}
            caption={current.alt}
            onScrub={(i) => {
              lastTouch.current = performance.now();
              goTo(i);
            }}
          />
          <TagButton dir="next" label="Next stall photo" disabled={active === n - 1} onClick={() => step(1)} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Photo ${active + 1} of ${n}: ${current.alt}`}
      </p>
    </div>
  );
}

// A price-tag shaped button hanging off the line; the clip-path lives on an inner span so the
// focus outline (drawn on the button) isn't clipped away.
function TagButton({
  dir,
  label,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? PiArrowLeft : PiArrowRight;
  const shape =
    dir === "prev"
      ? "polygon(30% 0, 100% 0, 100% 100%, 30% 100%, 0 50%)"
      : "polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%)";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group/tag shrink-0 rounded-md transition-[transform,opacity] duration-300 ease-out-soft enabled:hover:-translate-y-0.5 disabled:opacity-35"
    >
      <span
        className="relative flex h-11 w-[4.25rem] items-center justify-center bg-sea-700 text-sand-50 shadow-soft transition-colors duration-300 group-enabled/tag:group-hover/tag:bg-terracotta-500 group-enabled/tag:group-hover/tag:text-ink-deep"
        style={{ clipPath: shape }}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1/2 size-2 -translate-y-1/2 rounded-pill bg-surface-raised ${
            dir === "prev" ? "left-[1.1rem]" : "right-[1.1rem]"
          }`}
        />
        <Icon aria-hidden="true" className={`size-5 ${dir === "prev" ? "translate-x-2" : "-translate-x-2"}`} />
      </span>
    </button>
  );
}

// The rope: a slack wavy line with a knot per photo and a terracotta clothes-peg marking the current one.
// It is a real slider: drag or click to jump, arrow/Home/End keys to step.
function RopeScrubber({
  count,
  active,
  caption,
  onScrub,
}: {
  count: number;
  active: number;
  caption: string;
  onScrub: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [held, setHeld] = useState(false);
  const pct = (i: number) => (count > 1 ? (i / (count - 1)) * 100 : 50);

  const indexAt = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r || count < 2) return 0;
    return Math.round(clamp((clientX - r.left) / r.width, 0, 1) * (count - 1));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowUp: active + 1,
      ArrowLeft: active - 1,
      ArrowDown: active - 1,
      Home: 0,
      End: count - 1,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    e.stopPropagation();
    onScrub(clamp(next[e.key], 0, count - 1));
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Choose a stall photo"
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={active + 1}
      aria-valuetext={`Photo ${active + 1} of ${count}: ${caption}`}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setHeld(true);
        onScrub(indexAt(e.clientX));
      }}
      onPointerMove={(e) => {
        if (held) onScrub(indexAt(e.clientX));
      }}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      className={`relative h-11 min-w-0 flex-1 touch-none rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring ${
        held ? "cursor-grabbing" : "cursor-pointer"
      }`}
    >
      <svg
        viewBox="0 0 300 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 overflow-visible"
      >
        <path
          d="M0 8 C25 14 50 14 75 9 C100 4 125 4 150 9 C175 14 200 14 225 9 C250 4 275 4 300 8"
          fill="none"
          className="stroke-sand-600"
          strokeWidth="1.75"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill transition-colors duration-300 ${
            i <= active ? "bg-sea-700" : "bg-sand-400"
          }`}
          style={{ left: `${pct(i)}%` }}
        />
      ))}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 h-8 w-3.5 -translate-x-1/2 -translate-y-[62%] rounded-[4px] bg-terracotta-600 shadow-[0_3px_5px_rgb(0_51_71/0.35)] transition-[left,transform] duration-500 ease-out-soft after:absolute after:left-1/2 after:top-2.5 after:h-3 after:w-0.5 after:-translate-x-1/2 after:rounded-full after:bg-terracotta-900/55 ${
          held ? "scale-110" : ""
        }`}
        style={{ left: `${pct(active)}%` }}
      />
    </div>
  );
}
