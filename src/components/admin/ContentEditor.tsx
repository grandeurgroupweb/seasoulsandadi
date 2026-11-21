"use client";

import { useState, useTransition } from "react";
import { saveCategories, saveContentSection } from "@/lib/admin/actions/content";
import { REQUIRED_CONTENT_KEYS, type FieldErrors } from "@/lib/admin/schemas";
import type { Category, ContentKey, SiteContentRow } from "@/lib/types";
import { Field, fieldDescribedBy, TextArea, TextInput } from "./Field";
import { useToast } from "./Toast";
import { adminButton, panel } from "./styles";

const SECTION_ORDER = ["hero", "experience", "edition", "gallery", "vendor", "reels", "faq", "follow", "footer"];
const SECTION_TITLES: Record<string, string> = {
  hero: "Hero",
  experience: "The Experience",
  edition: "This Edition",
  gallery: "Event Gallery",
  vendor: "Vendors",
  reels: "Instagram reels",
  faq: "FAQ",
  follow: "Follow us",
  footer: "Footer",
};

function SaveButton({ pending, dirty, label }: { pending: boolean; dirty: boolean; label: string }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
      {dirty && !pending ? <span className="text-xs text-ink-muted">Unsaved changes</span> : null}
      <button type="submit" className={adminButton("primary")} disabled={pending || !dirty}>
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}

function SectionForm({ section, rows }: { section: string; rows: SiteContentRow[] }) {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.key, r.value])),
  );
  const [saved, setSaved] = useState(values);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const dirty = rows.some((r) => values[r.key] !== saved[r.key]);
  const headingId = `content-${section}`;

  return (
    <section aria-labelledby={headingId} className={`${panel} p-5 sm:p-6`}>
      <h2 id={headingId} className="mb-5 text-xl font-bold text-ink">
        {SECTION_TITLES[section] ?? section}
      </h2>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          const local: FieldErrors = {};
          rows.forEach((r) => {
            if (REQUIRED_CONTENT_KEYS.has(r.key) && !values[r.key]?.trim()) local[r.key] = "This one can't be empty";
          });
          if (Object.keys(local).length) {
            setErrors(local);
            document.getElementById(`content-field-${Object.keys(local)[0]}`)?.focus();
            return;
          }
          setErrors({});
          const entries = rows.map((r) => ({ key: r.key, value: values[r.key] ?? "" }));
          startTransition(async () => {
            const result = await saveContentSection(entries);
            if (result.ok) {
              setSaved(values);
            } else if (result.fieldErrors) {
              // Server errors are keyed by array index ("2.value"); map them back to content keys.
              const mapped: FieldErrors = {};
              Object.entries(result.fieldErrors).forEach(([path, message]) => {
                const row = rows[Number(path.split(".")[0])];
                if (row) mapped[row.key] = message;
              });
              setErrors(mapped);
            }
            toast.fromResult(result, "Section saved");
          });
        }}
      >
        {rows.map((row) => {
          const id = `content-field-${row.key}`;
          const required = REQUIRED_CONTENT_KEYS.has(row.key as ContentKey);
          const value = values[row.key] ?? "";
          const long = value.length > 70 || !required;
          const hint = required ? undefined : "Leave empty to hide this text on the site.";
          return (
            <Field
              key={row.key}
              id={id}
              label={row.label || row.key}
              hint={hint}
              error={errors[row.key]}
              optional={!required}
              counter={{ value: value.length, max: 600 }}
            >
              {long ? (
                <TextArea
                  id={id}
                  rows={2}
                  value={value}
                  disabled={pending}
                  invalid={Boolean(errors[row.key])}
                  describedBy={fieldDescribedBy(id, hint, errors[row.key])}
                  onChange={(e) => setValues((v) => ({ ...v, [row.key]: e.target.value }))}
                />
              ) : (
                <TextInput
                  id={id}
                  value={value}
                  disabled={pending}
                  invalid={Boolean(errors[row.key])}
                  describedBy={fieldDescribedBy(id, hint, errors[row.key])}
                  onChange={(e) => setValues((v) => ({ ...v, [row.key]: e.target.value }))}
                />
              )}
            </Field>
          );
        })}
        <SaveButton pending={pending} dirty={dirty} label="Save section" />
      </form>
    </section>
  );
}

function CategoriesForm({ categories }: { categories: Category[] }) {
  const toast = useToast();
  const initial = categories.map(({ id, label, description }) => ({ id, label, description }));
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const patch = (index: number, change: Partial<(typeof initial)[number]>) =>
    setValues((all) => all.map((c, i) => (i === index ? { ...c, ...change } : c)));

  return (
    <section aria-labelledby="content-categories" className={`${panel} p-5 sm:p-6`}>
      <h2 id="content-categories" className="text-xl font-bold text-ink">
        Experience categories
      </h2>
      <p className="mb-5 mt-1 text-sm text-ink-muted">The six chips in The Experience and the line shown under each.</p>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const local: FieldErrors = {};
          values.forEach((c, i) => {
            if (!c.label.trim()) local[`${i}.label`] = "Add a name";
          });
          if (Object.keys(local).length) {
            setErrors(local);
            return;
          }
          setErrors({});
          startTransition(async () => {
            const result = await saveCategories(values);
            if (result.ok) setSaved(values);
            else if (result.fieldErrors) setErrors(result.fieldErrors);
            toast.fromResult(result, "Categories saved");
          });
        }}
      >
        {values.map((c, i) => (
          <fieldset key={c.id} className="grid gap-4 border-b border-line pb-6 last:border-0 last:pb-0 sm:grid-cols-[14rem_1fr]">
            <legend className="sr-only">{c.label || c.id}</legend>
            <Field id={`cat-${c.id}-label`} label="Name" error={errors[`${i}.label`]} counter={{ value: c.label.length, max: 40 }}>
              <TextInput
                id={`cat-${c.id}-label`}
                value={c.label}
                disabled={pending}
                invalid={Boolean(errors[`${i}.label`])}
                describedBy={fieldDescribedBy(`cat-${c.id}-label`, undefined, errors[`${i}.label`])}
                onChange={(e) => patch(i, { label: e.target.value })}
              />
            </Field>
            <Field
              id={`cat-${c.id}-description`}
              label="Description"
              error={errors[`${i}.description`]}
              counter={{ value: c.description.length, max: 200 }}
              optional
            >
              <TextArea
                id={`cat-${c.id}-description`}
                rows={2}
                value={c.description}
                disabled={pending}
                invalid={Boolean(errors[`${i}.description`])}
                describedBy={fieldDescribedBy(`cat-${c.id}-description`, undefined, errors[`${i}.description`])}
                onChange={(e) => patch(i, { description: e.target.value })}
              />
            </Field>
          </fieldset>
        ))}
        <SaveButton pending={pending} dirty={dirty} label="Save categories" />
      </form>
    </section>
  );
}

export function ContentEditor({ rows, categories }: { rows: SiteContentRow[]; categories: Category[] }) {
  const rank = (s: string) => (SECTION_ORDER.includes(s) ? SECTION_ORDER.indexOf(s) : SECTION_ORDER.length);
  const sections = [...new Set(rows.map((r) => r.section))].sort((a, b) => rank(a) - rank(b));

  if (!rows.length) {
    return (
      <p className={`${panel} px-5 py-10 text-center text-ink-muted`}>
        No page text found. Run <code>supabase/seed.sql</code> to create the editable fields.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Jump to section" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {sections.map((s) => (
          <a
            key={s}
            href={`#content-${s}`}
            className="min-h-10 shrink-0 rounded-pill bg-surface-card px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:bg-sea-50"
          >
            {SECTION_TITLES[s] ?? s}
          </a>
        ))}
        {categories.length ? (
          <a
            href="#content-categories"
            className="min-h-10 shrink-0 rounded-pill bg-surface-card px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:bg-sea-50"
          >
            Categories
          </a>
        ) : null}
      </nav>
      {sections.map((section) => (
        <SectionForm
          key={section}
          section={section}
          rows={rows.filter((r) => r.section === section).sort((a, b) => a.sort_order - b.sort_order)}
        />
      ))}
      {categories.length ? <CategoriesForm categories={categories} /> : null}
    </div>
  );
}
