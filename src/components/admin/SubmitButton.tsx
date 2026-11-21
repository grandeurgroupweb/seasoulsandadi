"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LuLoaderCircle } from "react-icons/lu";
import { adminButton } from "./styles";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "",
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={adminButton("primary", "md", className)}>
      {pending ? (
        <>
          <LuLoaderCircle aria-hidden className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
