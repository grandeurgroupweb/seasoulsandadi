import { Birds } from "@/components/decor/Birds";
import { Lighthouse } from "@/components/decor/Lighthouse";
import { Palm } from "@/components/decor/Palm";
import { ThemeDecor } from "@/components/themes/ThemeDecor";

/** Palms at the band's edges, a lighthouse on the horizon and a few gulls; sits behind the content. */
export function EditionScenery({ theme }: { theme?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* soft horizon glow behind the lighthouse */}
      <div className="absolute -right-24 top-1/4 size-[28rem] rounded-full bg-sea-600/30 blur-3xl" />

      <Lighthouse
        variant="silhouette"
        className="absolute right-[calc((100%-78rem)/2-8rem)] bottom-0 hidden h-[22rem] text-sea-900 xl:block"
      />

      <Palm className="absolute -left-16 -bottom-8 h-64 text-sea-900 opacity-70 sm:h-80 lg:-left-28 lg:h-[26rem] lg:opacity-100" />
      <Palm
        className="absolute left-6 -bottom-12 hidden h-60 text-sea-950 sm:block lg:h-[21rem]"
        delay={2.5}
      />
      <Palm flip className="absolute -right-16 -bottom-8 h-56 text-sea-900 opacity-70 sm:h-72 lg:hidden" delay={1.2} />

      <ThemeDecor theme={theme} slot="edition">
        <Birds count={4} className="absolute right-[18%] top-[9%] w-36 text-sand-100/60 sm:w-48" />
        <Birds count={2} className="absolute left-[30%] top-[6%] hidden w-24 text-sand-100/40 lg:block" />
      </ThemeDecor>
    </div>
  );
}
