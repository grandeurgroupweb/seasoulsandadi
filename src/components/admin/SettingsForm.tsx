"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import { saveSettings } from "@/lib/admin/actions/settings";
import type { ActionResult } from "@/lib/admin/result";
import type { SiteSettings } from "@/lib/types";
import { Field, fieldDescribedBy, TextArea, TextInput } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { useToast } from "./Toast";
import { adminButton, panel } from "./styles";

type Values = Omit<SiteSettings, "id" | "updated_at">;
type Key = keyof Values;

const META: Record<Key, { label: string; hint?: string; type?: string; inputMode?: "numeric" | "url" | "email" | "tel" }> = {
  whatsapp_number: {
    label: "WhatsApp number",
    hint: "Digits only with the country code, e.g. 919573435222. Spaces and + are removed.",
    inputMode: "numeric",
  },
  whatsapp_message: { label: "WhatsApp starting message", hint: "Pre-filled when someone taps “Apply as a Vendor”." },
  instagram_url: { label: "Instagram link", type: "url", inputMode: "url" },
  facebook_url: { label: "Facebook link", type: "url", inputMode: "url" },
  email: { label: "Email", type: "email", inputMode: "email" },
  phone_display: { label: "Phone number as shown", hint: "Free text, e.g. +91 95734 35222", inputMode: "tel" },
};

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const toast = useToast();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveSettings, null);
  const [values, setValues] = useState<Values>({
    whatsapp_number: settings.whatsapp_number,
    whatsapp_message: settings.whatsapp_message,
    instagram_url: settings.instagram_url,
    facebook_url: settings.facebook_url,
    email: settings.email,
    phone_display: settings.phone_display,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!state) return;
    toast.fromResult(state, "Settings saved");
    if (!state.ok) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state, toast]);

  const digits = values.whatsapp_number.replace(/\D/g, "");
  const testHref = `https://wa.me/${digits}?text=${encodeURIComponent(values.whatsapp_message)}`;

  const field = (key: Key) => {
    const id = `settings-${key}`;
    const meta = META[key];
    const common = {
      id,
      name: key,
      value: values[key],
      invalid: Boolean(errors[key]),
      describedBy: fieldDescribedBy(id, meta.hint, errors[key]),
    };
    return (
      <Field
        id={id}
        label={meta.label}
        hint={meta.hint}
        error={errors[key]}
        counter={key === "whatsapp_message" ? { value: values[key].length, max: 300 } : undefined}
      >
        {key === "whatsapp_message" ? (
          <TextArea {...common} rows={3} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
        ) : (
          <TextInput
            {...common}
            type={meta.type ?? "text"}
            inputMode={meta.inputMode}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          />
        )}
      </Field>
    );
  };

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6">
      <section aria-labelledby="settings-whatsapp" className={`${panel} flex flex-col gap-5 p-5 sm:p-6`}>
        <h2 id="settings-whatsapp" className="text-xl font-bold text-ink">
          Vendor enquiries (WhatsApp)
        </h2>
        {field("whatsapp_number")}
        {field("whatsapp_message")}
        <a
          href={testHref}
          target="_blank"
          rel="noopener noreferrer"
          className={adminButton("ghost", "md", "w-fit")}
          aria-disabled={digits.length < 10 || undefined}
        >
          <LuExternalLink aria-hidden className="size-4" />
          Test WhatsApp link
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </section>

      <section aria-labelledby="settings-social" className={`${panel} flex flex-col gap-5 p-5 sm:p-6`}>
        <h2 id="settings-social" className="text-xl font-bold text-ink">
          Social and contact
        </h2>
        <p className="-mt-3 text-sm text-ink-muted">
          Used by the follow buttons, the edition card and the footer. Announcements and tickets go through these
          pages.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("instagram_url")}
          {field("facebook_url")}
          {field("email")}
          {field("phone_display")}
        </div>
      </section>

      <div className="flex justify-end">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}
