import type { ReactNode } from "react";
import { Reveal } from "@/components/site/sections/Reveal";
import { RevealText } from "./RevealText";

type Props = {
  id?: string;
  title: string;
  intro?: ReactNode;
  /** Short Anton label above the title, e.g. "THIS MONTH". */
  kicker?: string;
  align?: "center" | "start";
  as?: "h1" | "h2";
  /** "dark" for headings sitting on sea-colored (.on-dark) sections. */
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  id,
  title,
  intro,
  kicker,
  align = "center",
  as = "h2",
  tone = "light",
  className = "",
}: Props) {
  const alignClass = align === "center" ? "text-center mx-auto items-center" : "text-start items-start";
  const titleColor = tone === "dark" ? "text-sand-50" : "text-sea-700";
  const introColor = tone === "dark" ? "text-sand-100" : "text-ink-muted";
  const kickerColor = tone === "dark" ? "text-terracotta-300" : "text-terracotta-800";
  return (
    <div className={`flex max-w-prose flex-col gap-3 ${alignClass} ${className}`}>
      {kicker ? (
        <Reveal>
          <p className={`font-display text-sm uppercase tracking-[0.18em] ${kickerColor}`}>{kicker}</p>
        </Reveal>
      ) : null}
      <RevealText as={as} id={id} text={title} className={`font-serif text-section tracking-tight ${titleColor}`} />
      {intro ? (
        <Reveal delay={0.25}>
          <p className={`text-lg ${introColor}`}>{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
