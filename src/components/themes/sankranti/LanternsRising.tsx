import type { CSSProperties } from "react";
import { SkyLantern } from "./Lantern";
import s from "./sankranti.module.css";

export type RisingLantern = {
  /** Tailwind classes: position (where it rests when motion is off), size, responsive visibility. */
  className: string;
  /** Seconds for one climb. */
  dur: number;
  delay: number;
  /** Climb start / end offsets from the resting spot, and sideways drift (px). */
  from?: number;
  to?: number;
  dx?: number;
};

/** Candle lanterns floating up and fading out, on a loop. Still at their resting spots under reduced motion. */
export function LanternsRising({ lanterns }: { lanterns: RisingLantern[] }) {
  return (
    <>
      {lanterns.map((l, i) => (
        <div
          key={i}
          className={`${s.rise} absolute ${l.className}`}
          style={
            {
              "--dur": `${l.dur}s`,
              "--delay": `${-l.delay}s`,
              "--from": `${l.from ?? 140}px`,
              "--to": `${l.to ?? -180}px`,
              "--dx": `${l.dx ?? 24}px`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <SkyLantern className="h-full" delay={i * 0.6} />
        </div>
      ))}
    </>
  );
}
