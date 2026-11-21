import type { CSSProperties } from "react";
import { Kite } from "./Kite";
import { SkyLantern } from "./Lantern";
import s from "./sankranti.module.css";

type Float = { className: string; dur: number; delay: number; dx?: number; alpha?: number };

// Big lanterns keep to the side margins so they never sit on top of text; the small, faint
// "far away" ones can cross the middle like the distant lanterns in a real release.
const LANTERNS: Float[] = [
  { className: "left-[3%] h-14 lg:h-20", dur: 32, delay: 0, dx: 40 },
  { className: "right-[4%] h-12 lg:h-16", dur: 36, delay: 12, dx: -30 },
  { className: "left-[10%] hidden h-10 md:block", dur: 40, delay: 22, dx: 24 },
  { className: "right-[11%] hidden h-9 md:block", dur: 34, delay: 28, dx: 36 },
  { className: "left-[38%] h-4 lg:h-5", dur: 44, delay: 6, dx: 20, alpha: 0.7 },
  { className: "left-[62%] h-5 lg:h-6", dur: 48, delay: 18, dx: -24, alpha: 0.75 },
  { className: "left-[78%] hidden h-4 sm:block", dur: 42, delay: 34, dx: 16, alpha: 0.6 },
  { className: "left-[24%] hidden h-4 sm:block", dur: 46, delay: 40, dx: -14, alpha: 0.6 },
];

const vars = (v: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(v).map(([k, x]) => [`--${k}`, x])) as CSSProperties;

/**
 * Fixed layer over the whole page: candle lanterns floating up from the bottom of the screen
 * and a couple of kites riding across now and then. Never takes clicks; hidden with reduced motion.
 */
export function PageSky() {
  return (
    <div className={`${s.pageSky} pointer-events-none fixed inset-0 z-30 overflow-hidden`} aria-hidden="true">
      {LANTERNS.map((l, i) => (
        <div
          key={i}
          className={`${s.floatUp} absolute -bottom-24 ${l.className}`}
          style={vars({ dur: `${l.dur}s`, delay: `${-l.delay}s`, dx: `${l.dx ?? 30}px`, alpha: l.alpha ?? 1 })}
        >
          <SkyLantern className="h-full" delay={i * 0.5} />
        </div>
      ))}

      <div className={`${s.cross} absolute left-0 top-[18%]`} style={vars({ dur: "55s", delay: "-8s" })}>
        <Kite tone="terracotta" string={null} className="h-16 lg:h-24" />
      </div>
      <div className={`${s.cross} absolute left-0 top-[42%] hidden md:block`} style={vars({ dur: "70s", delay: "-44s" })}>
        <Kite tone="sea" string={null} delay={2} className="h-12 lg:h-16" />
      </div>
    </div>
  );
}
