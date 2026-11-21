type Props = {
  /** Which way the wave crests face. "top": the waves sit on top of the element below (default). */
  edge?: "top" | "bottom";
  /** Tailwind text-* classes for back, middle and front layers (front should match the section it leads into). */
  colors?: [string, string, string];
  className?: string;
  /** Animate the layers drifting sideways. */
  animate?: boolean;
};

// One 1440-wide period repeated twice, so translating by -50% loops seamlessly.
const WAVE =
  "M0 60 C240 18 480 18 720 60 C960 102 1200 102 1440 60 C1680 18 1920 18 2160 60 C2400 102 2640 102 2880 60 V140 H0Z";
const WAVE_SOFT =
  "M0 70 C360 34 720 34 1080 70 C1260 88 1350 92 1440 86 C1800 50 2160 50 2520 86 C2700 96 2790 94 2880 70 V140 H0Z";

/**
 * Layered, gently drifting waves for section edges. Place it as the first/last child of a
 * `relative` section; it's absolutely positioned and overlaps the neighbouring edge.
 */
export function Waves({
  edge = "top",
  colors = ["text-sea-300", "text-sea-500", "text-sea-800"],
  className = "",
  animate = true,
}: Props) {
  const flip = edge === "bottom" ? "rotate-180" : "";
  // A negative delay starts each layer at a different phase so the crests don't line up.
  const layer = (d: string, color: string, motion: string, phase: number, opacity = 1) => (
    <svg
      viewBox="0 0 2880 140"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 bottom-0 h-full w-[200%] ${color} ${animate ? motion : ""}`}
      style={{ animationDelay: `${-phase}s`, opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 h-16 overflow-hidden sm:h-20 lg:h-24 ${
        edge === "top" ? "bottom-full" : "top-full"
      } ${flip} ${className}`}
      aria-hidden="true"
    >
      {layer(WAVE_SOFT, colors[0], "decor-wave-slow", 7, 0.55)}
      {layer(WAVE, colors[1], "decor-wave", 5, 0.75)}
      <div className="absolute inset-x-0 bottom-0 h-[78%]">{layer(WAVE, colors[2], "decor-wave-slow", 0)}</div>
    </div>
  );
}
