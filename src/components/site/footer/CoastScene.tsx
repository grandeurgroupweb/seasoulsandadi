import type { ReactNode } from "react";
import { BeachPeople } from "@/components/decor/BeachPeople";
import { Birds } from "@/components/decor/Birds";
import { Lighthouse } from "@/components/decor/Lighthouse";
import { Palm } from "@/components/decor/Palm";
import { ThemeDecor } from "@/components/themes/ThemeDecor";

/** Evening beach along the bottom of the footer: sea meeting sand dunes, people sitting out, lighthouse at one side. */
export function CoastScene({ children, theme }: { children?: ReactNode; theme?: string }) {
  return (
    <div className="relative isolate h-64 overflow-hidden sm:h-72 lg:h-80">
      <ThemeDecor theme={theme} slot="footer">
        <Birds count={4} className="absolute right-[24%] top-6 w-32 text-sand-200/75 sm:right-[20%] sm:w-40" />
      </ThemeDecor>

      {/* The beach: figures are positioned in % of this box so they stay on the sand at every width. */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 sm:h-44 lg:h-48">
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 34 C240 26 480 38 720 32 C960 26 1200 38 1440 30 V200 H0Z" className="fill-sea-700" />
          <path
            d="M0 70 C140 58 260 74 400 66 C560 56 700 76 860 68 C1020 60 1160 74 1300 64 C1370 60 1410 64 1440 66 V200 H0Z"
            className="fill-sand-50/80"
          />
          <path
            d="M0 76 C140 64 260 80 400 72 C560 62 700 82 860 74 C1020 66 1160 80 1300 70 C1370 66 1410 70 1440 72 V200 H0Z"
            className="fill-sand-300"
          />
          <path
            d="M0 108 C200 94 380 102 560 104 C760 106 900 94 1100 98 C1260 102 1360 92 1440 96 V200 H0Z"
            className="fill-sand-200"
          />
        </svg>

        <Lighthouse className="absolute bottom-[58%] right-[9%] h-32 w-auto sm:right-[11%] sm:h-40 lg:h-48" />

        <BeachPeople variant="couple" className="absolute bottom-[44%] left-[38%] h-11 w-auto text-sea-900 sm:left-[26%] sm:h-14 lg:h-16" />
        <BeachPeople variant="family" className="absolute bottom-[45%] left-[46%] hidden h-14 w-auto text-sea-900 sm:block lg:h-16" />
        <BeachPeople variant="dog" className="absolute bottom-[44%] left-[66%] hidden h-14 w-auto text-sea-900 md:block lg:h-16" />
      </div>

      <Palm className="absolute -left-6 bottom-0 h-48 w-auto text-sea-950 sm:h-60 lg:h-68" delay={0} />
      <Palm className="absolute bottom-0 left-16 h-32 w-auto text-sea-950/90 sm:left-28 sm:h-40" flip delay={3} />
      <Palm className="absolute -right-8 bottom-0 h-40 w-auto text-sea-950 sm:h-52" flip delay={1.5} />

      <div className="absolute inset-x-0 bottom-0 px-gutter pb-5">{children}</div>
    </div>
  );
}
