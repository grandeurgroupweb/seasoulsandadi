type Props = {
  className?: string;
  /** Rotating light beams from the lantern room. */
  beam?: boolean;
  /** "color": sand tower with terracotta bands; "silhouette": single currentColor shape for dark bands. */
  variant?: "color" | "silhouette";
};

/** Vizag's lighthouse, drawn simply. The venue sits next to it. */
export function Lighthouse({ className = "", beam = true, variant = "color" }: Props) {
  const silhouette = variant === "silhouette";
  const tower = silhouette ? "currentColor" : "var(--color-sand-50)";
  const band = silhouette ? "currentColor" : "var(--color-terracotta-500)";
  const dark = silhouette ? "currentColor" : "var(--color-sea-900)";

  return (
    <svg viewBox="0 0 240 300" className={className} aria-hidden="true" focusable="false" overflow="visible">
      {beam ? (
        <g className="decor-beam" style={{ transformOrigin: "120px 58px" }}>
          <path d="M120 58 L-60 20 L-60 96Z" fill="var(--color-sand-50)" />
          <path d="M120 58 L300 20 L300 96Z" fill="var(--color-sand-50)" />
        </g>
      ) : null}
      <path d="M96 286 L144 286 L134 92 L106 92Z" fill={tower} />
      {/* Bands follow the tower's taper exactly, so no clipPath (and no duplicate ids) is needed. */}
      {!silhouette ? (
        <g fill={band}>
          <path d="M104.66 118 H135.34 L136.47 140 H103.53Z" />
          <path d="M101.98 170 H138.02 L139.15 192 H100.85Z" />
          <path d="M99.3 222 H140.7 L141.83 244 H98.17Z" />
        </g>
      ) : null}
      <rect x="114" y="150" width="12" height="16" rx="6" fill={dark} />
      <rect x="114" y="204" width="12" height="16" rx="6" fill={dark} />
      <rect x="98" y="80" width="44" height="12" rx="2" fill={dark} />
      <path d="M94 80h52" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <rect x="106" y="46" width="28" height="34" rx="3" fill={dark} />
      <rect x="111" y="51" width="18" height="24" rx="2" fill="var(--color-sand-100)" />
      <path d="M102 46 L120 26 L138 46Z" fill={silhouette ? dark : band} />
      <path d="M120 26 V16" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <path d="M84 286 h72 v10 h-72z" fill={dark} />
    </svg>
  );
}
