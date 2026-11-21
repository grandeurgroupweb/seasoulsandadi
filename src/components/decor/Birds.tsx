type Props = {
  className?: string;
  /** 1-5 gulls. */
  count?: number;
};

// x, y, scale, flap-delay — a loose V that doesn't look stamped.
const FLOCK: [number, number, number, number][] = [
  [8, 34, 1, 0],
  [58, 14, 0.8, 0.3],
  [104, 40, 0.65, 0.55],
  [146, 22, 0.9, 0.15],
  [186, 46, 0.55, 0.4],
];

/** A small flock of gulls drifting and flapping; colour from `currentColor`. */
export function Birds({ className = "", count = 3 }: Props) {
  return (
    <svg viewBox="0 0 220 70" className={`decor-glide ${className}`} aria-hidden="true" focusable="false" fill="none">
      {FLOCK.slice(0, Math.max(1, Math.min(count, FLOCK.length))).map(([x, y, s, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            className="decor-flap"
            style={{ animationDelay: `${-d}s` }}
            d="M0 8 Q8 0 15 7 Q22 0 30 8"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
