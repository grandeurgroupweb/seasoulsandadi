import type { CSSProperties } from "react";
import s from "./sankranti.module.css";

const BODY = {
  terracotta: "fill-terracotta-400",
  sand: "fill-sand-200",
  sea: "fill-sea-400",
} as const;

export type LanternTone = keyof typeof BODY;

type Props = { className?: string; tone?: LanternTone; delay?: number };

/**
 * Paper sky lantern (Khom Loi style): a crumpled paper cylinder lit from the open bottom,
 * brightest at the rim, with the candle flame showing through.
 */
export function SkyLantern({ className = "", delay = 0 }: Omit<Props, "tone">) {
  const vars = { "--delay": `${-delay}s` } as CSSProperties;
  return (
    <span className={`relative block ${className}`} aria-hidden="true">
      <span className={`${s.glow} ${s.flicker} absolute -inset-[80%] rounded-full`} style={vars} />
      <svg viewBox="0 0 40 46" className="relative h-full w-auto overflow-visible" focusable="false">
        {/* paper body: soft crumpled top, near-straight sides */}
        <path d="M5 7 Q8 3.5 12 5.5 Q16 3 21 4.5 Q26 2.5 30 4.8 Q33.5 3.6 35.5 7 L36 38 L4 38 Z" className="fill-terracotta-300" />
        {/* light rising from the candle: brighter towards the rim */}
        <path d="M8 14 Q20 11 32 14 L33 38 L7 38 Z" className={`${s.flicker} fill-terracotta-100/60`} style={vars} />
        <path d="M6 27 Q20 24 34 27 L35 38 L5 38 Z" className={`${s.flicker} fill-sand-50/45`} style={vars} />
        <path d="M13 5.5 L12 38 M27.5 4 L28.5 38" className="stroke-terracotta-500/25" strokeWidth="0.8" fill="none" />
        {/* open rim and flame */}
        <ellipse cx="20" cy="38" rx="16" ry="3.6" className="fill-terracotta-200 stroke-terracotta-500/50" strokeWidth="0.6" />
        <ellipse cx="20" cy="38.3" rx="12" ry="2.2" className={`${s.flicker} fill-sand-50`} style={vars} />
        <ellipse cx="20" cy="36" rx="1.8" ry="3" className={`${s.flicker} fill-sand-50`} style={vars} />
      </svg>
    </span>
  );
}

/** Round candle lantern hanging from a cord, for garlands. */
export function HangingLantern({ className = "", tone = "terracotta", delay = 0 }: Props) {
  const vars = { "--delay": `${-delay}s` } as CSSProperties;
  return (
    <span className={`${s.swing} relative block ${className}`} style={vars} aria-hidden="true">
      <span className={`${s.glow} ${s.flicker} absolute inset-x-[-60%] bottom-[-10%] top-[20%] rounded-full`} style={vars} />
      <svg viewBox="0 0 30 52" className="relative h-full w-auto" focusable="false">
        <path d="M15 0 V7" className="stroke-sand-100/70" strokeWidth="1" />
        <rect x="9.5" y="6" width="11" height="4" rx="1" className="fill-sea-900" />
        <ellipse cx="15" cy="24" rx="12" ry="14" className={BODY[tone]} />
        <path d="M15 10 V38 M8 12 Q3 24 8 36 M22 12 Q27 24 22 36" className="stroke-terracotta-700/40" strokeWidth="1" fill="none" />
        <ellipse cx="15" cy="25" rx="5.5" ry="8.5" className={`${s.flicker} fill-sand-50/80`} style={vars} />
        <rect x="10.5" y="37" width="9" height="3" rx="1" className="fill-sea-900" />
        <path d="M15 40 V51" className="stroke-terracotta-500" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
