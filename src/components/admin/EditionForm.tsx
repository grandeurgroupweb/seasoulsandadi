"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LuMapPin } from "react-icons/lu";
import { saveEdition } from "@/lib/admin/actions/edition";
import type { ActionResult } from "@/lib/admin/result";
import type { Edition } from "@/lib/types";
import { Field, fieldDescribedBy, SelectInput, TextInput, Toggle } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { useToast } from "./Toast";
import { panel } from "./styles";

type Values = {
  title: string;
  month_label: string;
  date_announced: boolean;
  event_date: string;
  venue_name: string;
  venue_city: string;
  map_url: string;
  highlights: string;
  theme: string;
};

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function Preview({ v }: { v: Values }) {
  return (
    <div className="on-dark flex flex-col gap-3 rounded-lg p-5" aria-label="Preview of the public edition card">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-sand-300">Preview</p>
      <p className="text-lg font-semibold text-sand-100">{v.title || "Edition title"}</p>
      <p className="text-4xl font-extrabold text-sand-50">{v.month_label || "Month"}</p>
      {v.date_announced && v.event_date ? (
        <p className="text-base font-semibold text-sand-100">{formatDate(v.event_date)}</p>
      ) : (
        <span className="w-fit rounded-pill bg-terracotta-500 px-3 py-1 text-sm font-bold text-ink-deep">
          Date Announcing Soon
        </span>
      )}
      <p className="flex items-center gap-2 text-sand-100">
        <LuMapPin aria-hidden className="size-5 text-terracotta-300" />
        {[v.venue_name, v.venue_city].filter(Boolean).join(", ") || "Venue"}
      </p>
      {v.highlights ? <p className="text-sm text-sand-200">{v.highlights}</p> : null}
    </div>
  );
}

export function EditionForm({ edition, themes }: { edition: Edition; themes: { id: string; label: string }[] }) {
  const toast = useToast();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveEdition, null);
  const [values, setValues] = useState<Values>({
    title: edition.title,
    month_label: edition.month_label,
    date_announced: edition.date_announced,
    event_date: edition.event_date ?? "",
    venue_name: edition.venue_name,
    venue_city: edition.venue_city,
    map_url: edition.map_url ?? "",
    highlights: edition.highlights,
    theme: themes.some((t) => t.id === edition.theme) ? (edition.theme as string) : "coastal",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!state) return;
    toast.fromResult(state, "Edition saved");
    if (!state.ok) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state, toast]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const text = (key: Exclude<keyof Values, "date_announced">, label: string, opts: { hint?: string; type?: string; optional?: boolean } = {}) => {
    const id = `edition-${key}`;
    return (
      <Field id={id} label={label} hint={opts.hint} error={errors[key]} optional={opts.optional}>
        <TextInput
          id={id}
          name={key}
          type={opts.type ?? "text"}
          value={values[key]}
          invalid={Boolean(errors[key])}
          describedBy={fieldDescribedBy(id, opts.hint, errors[key])}
          onChange={(e) => set(key, e.target.value)}
        />
      </Field>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <form ref={formRef} action={formAction} className={`${panel} flex flex-col gap-5 p-5 sm:p-6`}>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("title", "Title", { hint: "e.g. January Edition" })}
          {text("month_label", "Month", { hint: "Shown large on the card, e.g. January" })}
        </div>

        <div className="flex flex-col gap-4 rounded-md bg-surface-raised p-4">
          <Toggle
            id="edition-date_announced"
            name="date_announced"
            label="Date announced"
            description="When off, the site shows “Date Announcing Soon” instead of a date."
            checked={values.date_announced}
            onChange={(e) => set("date_announced", e.target.checked)}
          />
          {text("event_date", "Event date", {
            type: "date",
            hint: values.date_announced ? "Required while the date is announced." : "Saved, but hidden until you turn on “Date announced”.",
            optional: !values.date_announced,
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {text("venue_name", "Venue", { hint: "e.g. MGM Lawns" })}
          {text("venue_city", "City")}
        </div>
        {text("map_url", "Map link", { type: "url", hint: "Google Maps link to the venue.", optional: true })}
        {text("highlights", "Highlights line", { hint: "e.g. Shop · Eat · Music · Workshops · More", optional: true })}
        <Field id="edition-theme" label="Seasonal decor" hint="Adds festival decorations around the site. Coastal is the everyday look." error={errors.theme}>
          <SelectInput
            id="edition-theme"
            name="theme"
            value={values.theme}
            invalid={Boolean(errors.theme)}
            describedBy={fieldDescribedBy("edition-theme", "hint", errors.theme)}
            onChange={(e) => set("theme", e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        <div className="flex justify-end border-t border-line pt-5">
          <SubmitButton>Save edition</SubmitButton>
        </div>
      </form>

      <div className="lg:sticky lg:top-10">
        <Preview v={values} />
      </div>
    </div>
  );
}
