import type { IconType } from "react-icons";
import { PiArrowRightBold, PiHandHeart, PiHandshake, PiStorefront } from "react-icons/pi";

type Card = { href: string; title: string; line: string; icon: IconType; tone: keyof typeof TONES };

const TONES = {
  terracotta: {
    card: "bg-terracotta-500 text-ink-deep ring-terracotta-300/60",
    icon: "bg-sand-50/90 text-terracotta-700",
    line: "text-ink-deep/75",
    arrow: "bg-ink-deep text-sand-50",
  },
  sea: {
    card: "bg-sea-700 text-sand-50 ring-sea-400/50",
    icon: "bg-sand-50/15 text-sand-50",
    line: "text-sand-100/80",
    arrow: "bg-sand-50 text-sea-800",
  },
  sand: {
    card: "bg-surface-card text-sea-900 ring-sea-600/40",
    icon: "bg-sea-50 text-sea-700",
    line: "text-ink-muted",
    arrow: "bg-sea-700 text-sand-50",
  },
} as const;

/**
 * The three "Apply as …" calls to action as tappable cards. Each links to #apply-<role>,
 * which opens the matching form in ApplyDialog.
 */
export function ApplyCards({ vendorLabel }: { vendorLabel: string }) {
  const cards: Card[] = [
    { href: "#apply-vendor", title: vendorLabel, line: "Set up a stall with us", icon: PiStorefront, tone: "terracotta" },
    { href: "#apply-volunteer", title: "Apply as a Volunteer", line: "Help us on the day", icon: PiHandHeart, tone: "sea" },
    { href: "#apply-sponsor", title: "Apply as a Sponsor", line: "Support an edition", icon: PiHandshake, tone: "sand" },
  ];

  return (
    <ul className="flex w-full flex-col gap-3 sm:gap-4">
      {cards.map(({ href, title, line, icon: Icon, tone }) => {
        const t = TONES[tone];
        return (
          <li key={href}>
            <a
              href={href}
              className={`group relative isolate flex items-center gap-4 overflow-hidden rounded-xl p-3.5 pr-4 shadow-card ring-1 transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-lift focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring sm:p-4 sm:pr-5 ${t.card}`}
            >
              {/* light sweep across the card on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-sand-50/25 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out-soft group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className={`grid size-12 shrink-0 place-items-center rounded-lg sm:size-14 ${t.icon}`}>
                <Icon aria-hidden="true" className="size-6 transition-transform duration-300 ease-out-soft group-hover:scale-110 sm:size-7" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-lg font-semibold leading-tight sm:text-xl">{title}</span>
                <span className={`text-sm sm:text-base ${t.line}`}>{line}</span>
              </span>
              <span className={`grid size-10 shrink-0 place-items-center rounded-pill transition-transform duration-300 ease-out-soft group-hover:translate-x-1 ${t.arrow}`}>
                <PiArrowRightBold aria-hidden="true" className="size-4" />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
