"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Progressive-enhancement gate for entrance animations: returns `armed = true` only when the
 * element sits below the viewport after hydration, so it can be hidden and revealed on scroll.
 * Content that is already visible (or rendered without JS) is never hidden.
 */
export function useArmedReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) setArmed(true);
  }, []);

  return { ref, armed };
}
