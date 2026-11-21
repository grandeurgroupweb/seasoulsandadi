"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { Field, TextArea, TextInput } from "@/components/admin/Field";
import { buttonClass } from "@/components/ui/Button";
import { applicationMessage, isRoleId, ROLES, type RoleId } from "./roles";

// The dialog follows the URL hash (#apply-vendor etc.), so any plain link on the page can open it,
// including server-rendered ones, and a shared link opens the right form.
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash;

function clearHash() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function ApplyDialog({ whatsappNumber }: { whatsappNumber: string }) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const match = hash.match(/^#apply-(\w+)$/)?.[1] ?? "";
  const role: RoleId | null = isRoleId(match) ? match : null;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (role && !dialog.open) dialog.showModal();
    if (!role && dialog.open) dialog.close();
  }, [role]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="apply-title"
      onClose={() => role && clearHash()}
      // A click on the dimmed backdrop lands on the <dialog> itself.
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="m-auto w-[min(34rem,calc(100%-1.5rem))] max-h-[92dvh] overflow-hidden rounded-xl bg-surface-card p-0 text-ink shadow-lift backdrop:bg-sea-950/65 backdrop:backdrop-blur-sm"
    >
      {role ? <ApplyForm key={role} role={role} whatsappNumber={whatsappNumber} onDone={() => ref.current?.close()} /> : null}
    </dialog>
  );
}

function ApplyForm({ role: id, whatsappNumber, onDone }: { role: RoleId; whatsappNumber: string; onDone: () => void }) {
  const role = ROLES[id];
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries([...new FormData(e.currentTarget)].map(([k, v]) => [k, String(v)]));
    const number = whatsappNumber.replace(/\D/g, "");
    const href = `https://wa.me/${number}?text=${encodeURIComponent(applicationMessage(role, values))}`;
    window.open(href, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="flex max-h-[92dvh] flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
        <div className="flex flex-col gap-1">
          <h2 id="apply-title" className="font-serif text-3xl tracking-tight text-sea-800">
            {role.title}
          </h2>
          {!sent ? (
            <p className="text-sm text-ink-muted">Fill this in and tap Send. WhatsApp opens with your details ready to send to us.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDone}
          className="grid size-10 shrink-0 place-items-center rounded-pill text-ink-muted transition-colors hover:bg-sand-100 hover:text-ink"
        >
          <LuX aria-hidden className="size-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {sent ? (
        <div role="status" className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-pill bg-sea-50 text-sea-700">
            <LuCheck aria-hidden className="size-7" />
          </span>
          <p className="text-lg font-semibold text-ink">Your message is ready in WhatsApp.</p>
          <p className="max-w-xs text-sm text-ink-muted">Press send there and we&apos;ll get back to you. If WhatsApp didn&apos;t open, tap Back and try again.</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setSent(false)} className={buttonClass("outline")}>
              Back
            </button>
            <button type="button" onClick={onDone} className={buttonClass("primary")}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-7">
            {role.fields.map((f) => {
              const fieldId = `apply-${id}-${f.name}`;
              const common = {
                id: fieldId,
                name: f.name,
                required: f.required,
                placeholder: f.placeholder,
                autoComplete: f.autoComplete,
                maxLength: f.type === "textarea" ? 600 : 120,
              };
              return (
                <Field key={f.name} id={fieldId} label={f.label} optional={!f.required}>
                  {f.type === "textarea" ? (
                    <TextArea {...common} rows={2} />
                  ) : (
                    <TextInput
                      {...common}
                      type={f.type ?? "text"}
                      {...(f.type === "tel" ? { inputMode: "tel" as const, pattern: "[+]?[0-9][0-9 -]{8,15}" } : {})}
                    />
                  )}
                </Field>
              );
            })}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button type="button" onClick={onDone} className={buttonClass("outline")}>
              Cancel
            </button>
            <button type="submit" className={buttonClass("primary")}>
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
