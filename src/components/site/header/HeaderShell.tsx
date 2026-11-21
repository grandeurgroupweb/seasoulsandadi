"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { InstagramLogo } from "@/components/ui/BrandLogos";
import { SocialButton } from "@/components/ui/SocialButton";
import { NAV_LINKS } from "./nav";

type Props = { instagramUrl: string; facebookUrl: string };

const pillSpring = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.7,
} as const;

export function HeaderShell({ instagramUrl, facebookUrl }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Highlight the section sitting in the middle band of the viewport.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    // The trap spans the pill and the dropped panel, so the menu toggle stays reachable.
    const focusables = () =>
      Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const glass =
    scrolled || open
      ? "bg-sand-50/90 shadow-card"
      : "bg-sand-50/80 shadow-soft";

  return (
    <MotionConfig reducedMotion="user">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
        <AnimatePresence>
          {open ? (
            <motion.button
              key="scrim"
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto fixed inset-0 bg-sea-950/45 backdrop-blur-[2px] xl:hidden"
            />
          ) : null}
        </AnimatePresence>

        <div ref={containerRef} className="relative mx-auto max-w-site">
          <div
            className={`pointer-events-auto flex h-14 items-center justify-between gap-3 rounded-pill border border-line/80 py-1.5 pl-4 pr-1.5 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 ease-out-soft sm:pl-5 ${glass}`}
          >
            <a
              href="#top"
              className="flex min-w-0 shrink-0 items-center gap-2 rounded-pill sm:gap-2.5"
            >
              <Image
                src="/logo.webp"
                alt=""
                width={512}
                height={276}
                loading="eager"
                sizes="96px"
                className="h-9 w-auto sm:h-10"
              />
              <span className="whitespace-nowrap font-serif text-[1.05rem] leading-none tracking-tight text-sea-900 sm:text-xl">
                Sea Soul Sandadi
              </span>
            </a>

            <nav aria-label="Main" className="hidden xl:block">
              <ul className="flex items-center gap-0.5">
                {NAV_LINKS.map((link) => {
                  const isActive = active === link.id;
                  return (
                    <li key={link.id}>
                      <a
                        href={`#${link.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={`group relative inline-flex min-h-10 items-center rounded-pill px-3.5 text-[0.9375rem] font-medium transition-colors duration-200 2xl:px-4 ${
                          isActive
                            ? "text-ink-deep"
                            : "text-ink hover:text-sea-800"
                        }`}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="nav-active-pill"
                            transition={pillSpring}
                            aria-hidden="true"
                            className="absolute inset-0 rounded-pill bg-terracotta-100 shadow-inset"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-pill bg-sand-200/0 transition-colors duration-200 group-hover:bg-sand-200/70"
                          />
                        )}
                        <span className="relative">{link.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-1.5">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden min-h-11 items-center gap-2 rounded-pill border border-line bg-surface-card py-1 pl-1 pr-4 text-sm font-semibold text-ink shadow-soft transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-card sm:inline-flex"
              >
                <span className="grid size-9 place-items-center rounded-pill bg-white shadow-soft">
                  <InstagramLogo className="size-5 transition-transform duration-300 ease-out-soft group-hover:scale-110" />
                </span>
                Follow
                <span className="sr-only">
                  Sea Soul Sandadi on Instagram (opens in a new tab)
                </span>
              </a>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => (open ? close() : setOpen(true))}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="inline-flex size-11 items-center justify-center rounded-pill text-ink transition-colors hover:bg-sand-200/70 xl:hidden"
              >
                {open ? (
                  <LuX aria-hidden="true" className="size-6" />
                ) : (
                  <LuMenu aria-hidden="true" className="size-6" />
                )}
                <span className="sr-only">
                  {open ? "Close menu" : "Open menu"}
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.div
                key="panel"
                ref={panelRef}
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto absolute inset-x-0 top-full mt-2 max-h-[calc(100svh-6rem)] origin-top overflow-y-auto rounded-xl border border-line/80 bg-surface-card p-3 shadow-lift xl:hidden"
              >
                <nav aria-label="Main">
                  <ul className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => {
                      const isActive = active === link.id;
                      return (
                        <li key={link.id}>
                          <a
                            href={`#${link.id}`}
                            onClick={() => setOpen(false)}
                            aria-current={isActive ? "location" : undefined}
                            className={`flex min-h-12 items-center rounded-lg px-4 text-xl font-semibold transition-colors ${
                              isActive
                                ? "bg-terracotta-100 text-ink-deep"
                                : "text-ink hover:bg-sand-100"
                            }`}
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <div className="mt-3 border-t border-line px-1 pt-4">
                  <p className="mb-3 px-3 text-sm text-ink-muted">
                    Dates and tickets are announced on
                  </p>
                  <div className="flex flex-col gap-2 xs:flex-row">
                    <SocialButton platform="instagram" href={instagramUrl} className="flex-1 justify-center">
                      Instagram
                    </SocialButton>
                    <SocialButton platform="facebook" href={facebookUrl} className="flex-1 justify-center">
                      Facebook
                    </SocialButton>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>
    </MotionConfig>
  );
}
