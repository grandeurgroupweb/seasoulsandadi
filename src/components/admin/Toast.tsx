"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { LuCircleAlert, LuCircleCheck, LuX } from "react-icons/lu";
import type { ActionResult } from "@/lib/admin/result";

type Toast = { id: number; kind: "success" | "error"; message: string };
type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  /** Shows the right toast for a Server Action result. */
  fromResult: (result: ActionResult, fallbackSuccess?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = nextId.current++;
      setToasts((all) => [...all.slice(-2), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      fromResult: (result, fallbackSuccess = "Saved") =>
        result.ok ? push("success", result.message ?? fallbackSuccess) : push("error", result.error),
    }),
    [push],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md px-4 py-3 text-sm font-medium shadow-lift ${
              t.kind === "error" ? "bg-terracotta-800 text-white" : "bg-sea-900 text-sand-50"
            }`}
          >
            {t.kind === "error" ? (
              <LuCircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            ) : (
              <LuCircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-terracotta-300" />
            )}
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss message"
              className="-m-1 rounded-sm p-1 opacity-80 hover:opacity-100"
            >
              <LuX aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const api = use(ToastContext);
  if (!api) throw new Error("useToast must be used inside ToastProvider");
  return api;
}
