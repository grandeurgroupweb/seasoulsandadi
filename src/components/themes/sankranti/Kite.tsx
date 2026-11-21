import type { CSSProperties } from "react";
import s from "./sankranti.module.css";

const TONES = {
  terracotta: { left: "fill-terracotta-400", right: "fill-terracotta-600", bow: "fill-sea-500" },
  sea: { left: "fill-sea-400", right: "fill-sea-600", bow: "fill-terracotta-400" },
  sand: { left: "fill-sand-50", right: "fill-sand-200", bow: "fill-terracotta-500" },
} as const;

type Props = {
  className?: string;
  tone?: keyof typeof TONES;
  /** Seconds; offsets the drift so kites don't move in step. */
  delay?: number;
  duration?: number;
  /** Tailwind stroke class for the string, e.g. "stroke-sea-800/40"; null hides it. */
  string?: string | null;
};

/** A diamond Sankranti kite with a bowed tail and its string trailing down-left. */
export function Kite({ className = "", tone = "terracotta", delay = 0, duration = 7, string = "stroke-sea-800/35" }: Props) {
  const t = TONES[tone];
  const vars = { "--delay": `${-delay}s`, "--dur": `${duration}s` } as CSSProperties;

  return (
    <div className={`${s.kite} ${className}`} style={vars} aria-hidden="true">
      <svg viewBox="0 0 60 150" className="h-full w-auto overflow-visible" focusable="false">
        {string ? (
          <path d="M30 58 Q 6 130 -90 260" fill="none" strokeWidth="1" className={string} vectorEffect="non-scaling-stroke" />
        ) : null}
        <path d="M30 2 L6 36 L30 80 Z" className={t.left} />
        <path d="M30 2 L54 36 L30 80 Z" className={t.right} />
        <path d="M30 2 V80 M6 36 H54" className="stroke-sand-50/60" strokeWidth="1.2" fill="none" />
        <g className={s.tail} style={vars}>
          <path d="M30 80 C 24 92 36 102 30 114 C 24 126 36 136 30 148" fill="none" strokeWidth="1.2" className="stroke-sea-900/50" />
          {[96, 116, 136].map((y) => (
            <path key={y} d={`M30 ${y} l-6 -4 v8 Z M30 ${y} l6 -4 v8 Z`} className={t.bow} />
          ))}
        </g>
      </svg>
    </div>
  );
}
