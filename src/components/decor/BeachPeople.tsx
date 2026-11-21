import type { ReactNode } from "react";

type Variant = "couple" | "family" | "dog";

type Props = {
  className?: string;
  variant?: Variant;
};

// Every figure stands on a ground line at y = 70, facing right.
const GROUND = 70;

/** One person sitting on the sand with knees up and arms around them. */
function Sitter({ x = 0, scale = 1, bun = false }: { x?: number; scale?: number; bun?: boolean }) {
  return (
    <g transform={`translate(${x} ${GROUND * (1 - scale)}) scale(${scale})`}>
      <circle cx="22" cy="12" r="7" />
      {bun ? <circle cx="15" cy="9" r="4" /> : null}
      <path d="M14 24 Q22 16 30 24 L31 62 L13 66Z" />
      <rect x="12" y="58" width="22" height="12" rx="5" />
      <path d="M26 58 L46 40 L52 46 L32 68Z" />
      <path d="M46 40 L52 44 L54 70 L44 70Z" />
      <rect x="44" y="66" width="14" height="4" rx="2" />
      <path d="M24 30 L46 46" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

/** A dog sitting upright, facing right. */
function Dog({ x = 0 }: { x?: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx="10" cy="62" rx="10" ry="8" />
      <path d="M12 68 L16 42 Q22 36 28 40 L28 70Z" />
      <circle cx="27" cy="36" r="6.5" />
      <rect x="29" y="35" width="9" height="5.5" rx="2.5" />
      <path d="M21 33 L23 24 L28 31Z" />
      <rect x="22" y="52" width="4" height="18" rx="2" />
      <path d="M2 64 Q-6 58 -3 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

const SCENES: Record<Variant, { viewBox: string; body: ReactNode }> = {
  couple: {
    viewBox: "0 0 100 72",
    body: (
      <>
        <Sitter />
        <Sitter x={36} scale={0.93} bun />
      </>
    ),
  },
  family: {
    viewBox: "0 0 140 72",
    body: (
      <>
        <Sitter />
        <Sitter x={44} scale={0.6} />
        <Sitter x={76} scale={0.94} bun />
      </>
    ),
  },
  dog: {
    viewBox: "-8 0 110 72",
    body: (
      <>
        <Sitter scale={0.96} bun />
        <Dog x={62} />
      </>
    ),
  },
};

/** Silhouettes of people relaxing on the beach; colour comes from `currentColor` (set a text-* class). */
export function BeachPeople({ className = "", variant = "couple" }: Props) {
  const scene = SCENES[variant];
  return (
    <svg viewBox={scene.viewBox} className={className} fill="currentColor" aria-hidden="true" focusable="false" overflow="visible">
      {scene.body}
    </svg>
  );
}
