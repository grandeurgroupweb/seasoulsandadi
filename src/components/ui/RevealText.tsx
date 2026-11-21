"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ElementType } from "react";
import { useArmedReveal } from "./useArmedReveal";

type Props = {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
};

/**
 * Words slide up out of a mask, one after another, when the text is scrolled into view.
 * Text that is on screen at load (or rendered without JS) shows immediately and never hides.
 * Screen readers get the plain sentence; the split words are hidden from them.
 */
export function RevealText({ text, as: Tag = "span", id, className = "", delay = 0, stagger = 0.07 }: Props) {
  const reduce = useReducedMotion();
  const { ref, armed } = useArmedReveal<HTMLElement>();
  const words = text.split(/\s+/).filter(Boolean);

  if (reduce || !armed) {
    return (
      <Tag ref={ref} id={id} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className} aria-label={text}>
      <motion.span
        key="armed"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.6 }}
        aria-hidden="true"
        className="inline"
      >
        {words.map((word, i) => (
          // Inline-block mask per word; padding keeps descenders (g, y, p) from being clipped.
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                hidden: { y: "110%", rotate: 4 },
                shown: {
                  y: "0%",
                  rotate: 0,
                  transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger },
                },
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
