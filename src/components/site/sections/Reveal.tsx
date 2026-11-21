"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useArmedReveal } from "@/components/ui/useArmedReveal";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const { ref, armed } = useArmedReveal<HTMLDivElement>();

  // Server HTML and anything already on screen render plainly visible; only content below the
  // fold at load is hidden, then animated in when scrolled to. No JS = everything visible.
  if (reduce || !armed) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      key="armed"
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
