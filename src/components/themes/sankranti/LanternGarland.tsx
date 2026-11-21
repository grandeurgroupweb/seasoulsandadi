import { HangingLantern, type LanternTone } from "./Lantern";

const TONES: LanternTone[] = ["terracotta", "sand", "sea", "sand"];

type Props = {
  className?: string;
  /** Number of dips in the cord; one lantern hangs at the bottom of each dip. */
  swags?: number;
  /** Tailwind height class for each lantern. */
  lantern?: string;
};

/**
 * A cord strung in dips across its box with a lantern at the bottom of each dip.
 * The cord stretches to any width; lanterns are placed in % so they stay on it.
 */
export function LanternGarland({ className = "", swags = 4, lantern = "h-12" }: Props) {
  const w = 100 / swags;
  const cord = Array.from({ length: swags }, (_, i) => `M${i * w} 4 Q${i * w + w / 2} 84 ${(i + 1) * w} 4`).join(" ");

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" focusable="false">
        <path d={cord} fill="none" strokeWidth="1.2" className="stroke-sand-100/60" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: swags }, (_, i) => (
        // y at the bottom of a dip = 4 + 160·0.5·0.5 = 44%
        <div key={i} className="absolute top-[44%] -translate-x-1/2" style={{ left: `${i * w + w / 2}%` }}>
          <HangingLantern tone={TONES[i % TONES.length]} delay={i * 0.7} className={lantern} />
        </div>
      ))}
    </div>
  );
}
