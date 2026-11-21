"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

// Where each polaroid flies when the map zooms in: away from the card's centre.
const FLY: Record<string, { x: number; y: number; r: number }> = {
  tl: { x: -0.45, y: -0.55, r: -24 },
  tr: { x: 0.45, y: -0.6, r: 22 },
  bl: { x: -0.5, y: 0.5, r: 18 },
  br: { x: 0.5, y: 0.55, r: -20 },
};

/**
 * Wraps the server-rendered hero and adds motion by data attributes:
 * floating polaroids, pointer parallax (desktop), and a short pinned scroll where the
 * venue map zooms to full screen ("stepping into the market") at every width.
 */
export function HeroMotion({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-float]", el).forEach((node, i) => {
          gsap.to(node, {
            y: i % 2 ? 8 : -8,
            rotation: i % 2 ? 1 : -1,
            duration: 3.4 + i * 0.45,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      });

      mm.add(`${DESKTOP_MOTION} and (pointer: fine)`, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", el).map((node) => ({
          depth: Number(node.dataset.depth) || 10,
          x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3" }),
        }));
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.depth);
            l.y(ny * l.depth);
          });
        };
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      });

      mm.add({ desktop: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        const map = el.querySelector<HTMLElement>("[data-hero='map']");
        const inside = el.querySelector<HTMLElement>("[data-hero='inside']");
        if (!motion || !map) return;

        // The pin starts when the hero's bottom meets the viewport bottom, so the hero always fills the
        // screen while pinned (on phones the hero is taller than the screen). On desktop the hero is
        // exactly one screen tall, so this is the same moment as "top top".
        // `offset` = how far the hero's top sits above the viewport top at that moment.
        const offset = () => Math.max(0, el.offsetHeight - window.innerHeight);
        const target = () => {
          const r = map.getBoundingClientRect();
          const s = el.getBoundingClientRect();
          return {
            cx: r.left + r.width / 2,
            cy: r.top - s.top + r.height / 2 - offset(),
            w: map.offsetWidth,
            h: map.offsetHeight,
          };
        };
        // "Step inside" sits at 40% of the screen height, wherever the hero's top is.
        const insideY = () => (inside ? offset() + window.innerHeight * 0.4 - inside.offsetTop : 0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: el,
            start: "bottom bottom",
            end: desktop ? "+=110%" : "+=90%",
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to("[data-hero='copy']", { y: -110, autoAlpha: 0, ease: "power2.in", duration: 0.4 }, 0)
          .to("[data-hero='chrome']", { autoAlpha: 0, duration: 0.25 }, 0.05)
          .to(
            map,
            {
              x: () => window.innerWidth / 2 - target().cx,
              y: () => window.innerHeight / 2 - target().cy,
              rotation: 0,
              scale: () => {
                const t = target();
                return Math.max(window.innerWidth / t.w, window.innerHeight / t.h) * 1.04;
              },
              duration: 1,
            },
            0,
          )
          .to("[data-hero='map-img']", { borderRadius: 0, duration: 0.6 }, 0.35);

        gsap.utils.toArray<HTMLElement>("[data-hero='pol']", el).forEach((node, i) => {
          const f = FLY[node.dataset.dir ?? "tl"] ?? FLY.tl;
          tl.to(
            node,
            {
              x: () => f.x * window.innerWidth,
              y: () => f.y * window.innerHeight,
              rotation: f.r,
              autoAlpha: 0,
              ease: "power2.in",
              duration: 0.6,
            },
            0.02 + i * 0.04,
          );
        });

        tl.to("[data-hero='palm-l']", { xPercent: -45, scale: 1.12, duration: 0.9 }, 0)
          .to("[data-hero='palm-r']", { xPercent: 45, scale: 1.12, duration: 0.9 }, 0)
          .to("[data-hero='lighthouse']", { xPercent: 60, autoAlpha: 0, duration: 0.7 }, 0)
          .to("[data-hero='birds']", { y: -140, x: 90, autoAlpha: 0, duration: 0.8 }, 0)
          .to("[data-hero='sun']", { y: -80, autoAlpha: 0, duration: 0.6 }, 0)
          .fromTo(
            "[data-hero='inside']",
            { autoAlpha: 0, y: () => insideY() + 30 },
            { autoAlpha: 1, y: () => insideY(), ease: "power2.out", duration: 0.3 },
            0.72,
          );

        // The collage pops in with a CSS animation; re-measure the map once it has settled.
        const settle = window.setTimeout(() => ScrollTrigger.refresh(), 1400);
        return () => window.clearTimeout(settle);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
