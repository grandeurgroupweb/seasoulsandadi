type Props = {
  className?: string;
  /** Mirror horizontally so a pair can frame a section from both edges. */
  flip?: boolean;
  /** Fronds sway gently around the crown. */
  sway?: boolean;
  /** Seconds offset so neighbouring palms don't move in lockstep. */
  delay?: number;
};

// [frond blade, midrib] pairs radiating from the crown at (122, 94).
const FRONDS: [string, string][] = [
  ["M120 92 C152 54 198 58 208 108 C190 84 160 78 120 96Z", "M122 94 C156 70 192 74 204 104"],
  ["M120 90 C140 40 182 22 208 34 C176 38 152 58 120 94Z", "M122 90 C146 54 180 36 204 36"],
  ["M120 92 C88 54 42 58 32 108 C50 84 80 78 120 96Z", "M118 94 C84 70 48 74 36 104"],
  ["M120 90 C100 40 58 22 32 34 C64 38 88 58 120 94Z", "M118 90 C94 54 60 36 36 36"],
  ["M120 90 C124 48 142 16 164 2 C152 34 138 62 121 94Z", "M121 90 C130 54 146 24 162 6"],
  ["M120 90 C112 50 96 20 74 6 C90 36 104 62 119 94Z", "M119 90 C110 54 94 26 78 9"],
  ["M122 94 C160 92 188 120 190 162 C174 132 150 112 122 98Z", "M122 96 C158 102 182 128 188 158"],
  ["M118 94 C80 92 52 120 50 162 C66 132 90 112 118 98Z", "M118 96 C82 102 58 128 52 158"],
];

const highlight = { stroke: "var(--color-sand-100)", strokeLinecap: "round" as const, fill: "none" };

/** Coconut palm silhouette; colour comes from `currentColor` (set a text-* class). */
export function Palm({ className = "", flip = false, sway = true, delay = 0 }: Props) {
  return (
    <svg
      viewBox="0 0 240 320"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M101 320 C105 250 116 172 118 96 L128 96 C126 172 116 252 116 320Z" fill="currentColor" />
      <path
        d="M105 296h11M107 268h11M109 240h11M111 212h11M113 184h11M115 156h10M116 128h10"
        {...highlight}
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <g
        className={sway ? "decor-sway" : undefined}
        style={{ transformOrigin: "122px 94px", animationDelay: `${-delay}s` }}
      >
        {FRONDS.map(([blade]) => (
          <path key={blade} d={blade} fill="currentColor" />
        ))}
        <path d={FRONDS.map(([, rib]) => rib).join(" ")} {...highlight} strokeOpacity="0.28" strokeWidth="1.6" />
        <circle cx="116" cy="101" r="6" fill="currentColor" />
        <circle cx="128" cy="102" r="6" fill="currentColor" />
        <circle cx="122" cy="110" r="6" fill="currentColor" />
      </g>
    </svg>
  );
}
