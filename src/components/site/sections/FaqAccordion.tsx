"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { PiPlus } from "react-icons/pi";

type Item = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();
  const reduce = useReducedMotion();

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => {
        const open = openId === item.id;
        const buttonId = `${baseId}-q-${index}`;
        const panelId = `${baseId}-a-${index}`;
        return (
          <li
            key={item.id}
            className={`rounded-md border-l-4 bg-surface-card transition-[box-shadow,border-color] duration-300 ease-out-soft ${
              open ? "border-terracotta-500 shadow-card" : "border-transparent shadow-soft hover:shadow-card"
            }`}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex min-h-14 w-full items-center gap-4 rounded-md px-5 py-4 text-start text-lg font-semibold text-ink md:text-xl"
              >
                {/* Decorative counter: hidden so the heading reads as just the question to search engines and screen readers. */}
                <span aria-hidden="true" className="font-display text-xl tracking-wide text-terracotta-800 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{item.question}</span>
                <PiPlus
                  aria-hidden="true"
                  className={`size-6 shrink-0 text-sea-600 transition-transform duration-200 ease-in-out-soft ${
                    open ? "rotate-45" : ""
                  }`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="answer"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.65, 0, 0.35, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-base text-ink-muted md:ps-15">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
