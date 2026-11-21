"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CategoryIcon } from "./CategoryIcon";

export type ExperiencePhoto = { url: string; alt: string };
export type ExperienceCategory = {
  id: string;
  label: string;
  description: string;
  icon: string;
  photos: ExperiencePhoto[];
};

const MAX_THUMBS = 3;

export function ExperiencePanels({ categories }: { categories: ExperienceCategory[] }) {
  const [active, setActive] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  // Deep links like /#experience-food open that panel.
  useEffect(() => {
    function syncFromHash() {
      const slug = window.location.hash.replace("#experience-", "");
      const index = categories.findIndex((c) => c.id === slug);
      if (index >= 0) setActive(index);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [categories]);

  function hoverOpen(index: number) {
    // Touch devices fire mouseenter on tap; only real pointers expand on hover.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setActive(index);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: categories.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + categories.length) % categories.length;
    setActive(next);
    buttonRefs.current[next]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="What you'll find at Sea Soul Sandadi"
      className="flex flex-col gap-3 lg:h-[34rem] lg:flex-row"
    >
      {categories.map((category, index) => {
        const open = index === active;
        const [cover, ...rest] = category.photos;
        const thumbs = rest.slice(0, MAX_THUMBS);
        const more = rest.length - thumbs.length;
        const contentId = `${baseId}-${category.id}`;

        return (
          <div
            key={category.id}
            id={`experience-${category.id}`}
            className={`group relative isolate scroll-mt-28 overflow-hidden rounded-xl bg-sea-800 shadow-card transition-[flex-grow,height,box-shadow] duration-[600ms] ease-out-soft motion-reduce:transition-none lg:h-auto lg:min-w-[4.75rem] lg:basis-0 ${
              open
                ? "h-[24rem] shadow-lift ring-2 ring-terracotta-400 ring-offset-2 ring-offset-surface lg:grow-[5]"
                : "h-[4.75rem] hover:shadow-lift lg:grow"
            }`}
          >
            {cover ? (
              <Image
                src={cover.url}
                alt={open ? cover.alt : ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`-z-10 object-cover transition-transform duration-[900ms] ease-out-soft motion-reduce:transition-none ${
                  open ? "scale-100" : "scale-110"
                }`}
              />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 -z-10 grid place-items-center bg-sea-700">
                <CategoryIcon name={category.icon} className="size-24 text-sea-500" />
              </div>
            )}

            {/* Tint only darkens where the text sits (left on phone bars, bottom on desktop rails) so photos still read. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 -z-10 transition-opacity duration-500 ease-out-soft ${
                open
                  ? "bg-linear-to-t from-sea-950/95 via-sea-900/45 to-sea-900/0"
                  : "bg-linear-to-r from-sea-950/85 via-sea-900/40 to-sea-900/5 lg:bg-linear-to-t lg:from-sea-950/90 lg:via-sea-900/35 lg:to-sea-900/0"
              }`}
            />

            <button
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setActive(index)}
              onMouseEnter={() => hoverOpen(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="absolute inset-0 z-10 flex rounded-xl text-start focus-visible:outline-offset-[-4px] focus-visible:outline-sand-100"
            >
              <span
                aria-hidden={open}
                className={`flex items-center gap-3 px-5 text-sand-50 transition-opacity duration-300 ease-out-soft lg:h-full lg:w-full lg:flex-col-reverse lg:justify-start lg:gap-4 lg:px-0 lg:py-6 ${
                  open ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
                }`}
              >
                <CategoryIcon name={category.icon} className="size-6 shrink-0 text-terracotta-300" />
                <span className="text-base font-semibold whitespace-nowrap [text-shadow:0_1px_4px_rgb(0_33_46/0.8)] lg:[writing-mode:vertical-rl] lg:rotate-180">
                  {category.label}
                </span>
              </span>
              <span className="sr-only">{open ? `${category.label}, expanded` : `Show ${category.label}`}</span>
            </button>

            <div
              id={contentId}
              aria-hidden={!open}
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-5 text-sand-50 transition-[opacity,translate] duration-500 ease-out-soft motion-reduce:transition-none sm:p-7 lg:w-[30rem] lg:max-w-full ${
                open ? "translate-y-0 opacity-100 delay-200" : "translate-y-3 opacity-0"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-terracotta-500 text-ink-deep shadow-soft">
                  <CategoryIcon name={category.icon} className="size-6" />
                </span>
                <h3 className="text-2xl font-semibold text-sand-50">{category.label}</h3>
              </span>
              <p className="max-w-md text-base text-sand-100">{category.description}</p>
              {thumbs.length ? (
                <ul className="mt-1 flex items-center gap-2">
                  {thumbs.map((photo) => (
                    <li
                      key={photo.url}
                      className="relative size-14 overflow-hidden rounded-md ring-2 ring-sand-100/80 sm:size-16"
                    >
                      <Image src={photo.url} alt={photo.alt} fill sizes="64px" className="object-cover" />
                    </li>
                  ))}
                  {more > 0 ? (
                    <li className="ms-1 rounded-pill bg-sand-50/15 px-3 py-1.5 text-sm font-semibold text-sand-50 ring-1 ring-sand-100/40">
                      +{more} photos
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
