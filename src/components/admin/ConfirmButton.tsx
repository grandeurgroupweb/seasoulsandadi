"use client";

import { useId, useRef, type ReactNode } from "react";
import { adminButton } from "./styles";

type Props = {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  /** Accessible name of the trigger when it only shows an icon. */
  triggerLabel: string;
  triggerClassName: string;
  children: ReactNode;
};

/** Native <dialog>: focus trap, Esc to close and focus return come from the browser. */
export function ConfirmButton({ title, body, confirmLabel, onConfirm, disabled, triggerLabel, triggerClassName, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        title={triggerLabel}
        disabled={disabled}
        className={triggerClassName}
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg bg-surface-card p-6 text-ink shadow-lift backdrop:bg-sea-950/50"
      >
        <h2 id={titleId} className="text-xl font-bold text-ink">
          {title}
        </h2>
        <p id={bodyId} className="mt-2 text-sm text-ink-muted">
          {body}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" autoFocus className={adminButton("ghost")} onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button
            type="button"
            className={adminButton("danger")}
            onClick={() => {
              dialogRef.current?.close();
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
