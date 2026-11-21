import { Kite } from "./Kite";
import { LanternGarland } from "./LanternGarland";
import { LanternsRising } from "./LanternsRising";

/** Hero sky: kites instead of gulls, lanterns floating up on the map side. data-hero="birds" lets the scroll zoom fly them away. */
export function HeroDecor() {
  return (
    <div data-hero="birds" aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Kite tone="terracotta" className="absolute right-[5%] top-[13%] h-24 sm:right-[8%] sm:h-32 lg:left-[46%] lg:right-auto lg:top-[10%] lg:h-44" />
      <Kite tone="sea" delay={2.4} duration={8} className="absolute right-[27%] top-[21%] h-14 sm:top-[11%] sm:h-20 lg:right-[8%] lg:top-[12%] lg:h-32" />
      <Kite tone="terracotta" delay={4.1} duration={6.5} className="absolute right-[24%] top-[10%] hidden h-20 lg:block" />
      <LanternsRising
        lanterns={[
          { className: "right-[14%] top-[40%] hidden h-12 sm:block lg:right-[6%] lg:top-[30%] lg:h-16", dur: 17, delay: 2 },
          { className: "left-[52%] top-[24%] hidden h-12 lg:block", dur: 20, delay: 9, dx: -18 },
          { className: "right-[30%] top-[52%] hidden h-10 lg:block", dur: 15, delay: 5, dx: 30 },
        ]}
      />
    </div>
  );
}

/** This Edition band: a lantern garland across the top and a kite over the horizon. */
export function EditionDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <LanternGarland swags={3} lantern="h-10" className="absolute inset-x-0 top-4 h-16 sm:hidden" />
      <LanternGarland swags={6} lantern="h-14 lg:h-16" className="absolute inset-x-0 top-6 hidden h-20 sm:block lg:h-24" />
      <Kite tone="sand" string="stroke-sand-100/30" className="absolute right-[12%] top-[16%] hidden h-28 lg:block" />
    </div>
  );
}

/** Follow Us card: a short lantern garland in the top-right corner, where the gulls were (clear of the title). */
export function FollowDecor() {
  return <LanternGarland swags={2} lantern="h-11 sm:h-12" className="absolute right-5 top-1 h-12 w-[42%]" />;
}

/** Footer beach at dusk: kites over the sea and lanterns drifting up past the lighthouse. */
export function FooterDecor() {
  return (
    <>
      <Kite tone="terracotta" string="stroke-sand-100/30" className="absolute left-[22%] top-6 h-20 sm:left-[30%] sm:h-24" />
      <Kite tone="sand" delay={3} string="stroke-sand-100/30" className="absolute right-[34%] top-10 hidden h-16 sm:block" />
      <LanternsRising
        lanterns={[
          { className: "right-[20%] top-[34%] h-9 sm:h-10", dur: 14, delay: 1, to: -150 },
          { className: "right-[8%] top-[20%] h-7 sm:h-8", dur: 16, delay: 7, dx: -16, to: -120 },
          { className: "right-[46%] top-[30%] hidden h-8 md:block", dur: 18, delay: 4, to: -150 },
        ]}
      />
    </>
  );
}
