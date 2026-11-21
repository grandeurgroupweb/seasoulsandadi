"use client";

import { PLACEMENT_LABELS, PLACEMENTS } from "@/lib/admin/schemas";
import type { Category, CategoryId, Placement } from "@/lib/types";
import { Field, fieldDescribedBy, SelectInput, TextArea, TextInput, Toggle } from "../Field";

export type ImageDraft = {
  alt: string;
  category_id: CategoryId | null;
  placement: Placement;
  link_url: string;
  is_published: boolean;
};

export type ImageDraftErrors = Partial<Record<keyof ImageDraft, string>>;

export const PLACEMENT_HELP: Record<Placement, string> = {
  hero: "Scroll-zoom at the top of the page. Venue layouts first, then scene photos.",
  gallery: "The auto-scrolling Event Gallery strip and the Experience category showcase.",
  vendor: "Stall photos beside “Be a Part of Sea Soul Sandadi”.",
  reel: "Portrait thumbnails in the Instagram row. Add the reel’s link.",
};

type Props = {
  idPrefix: string;
  draft: ImageDraft;
  errors?: ImageDraftErrors;
  categories: Category[];
  onChange: (patch: Partial<ImageDraft>) => void;
  disabled?: boolean;
};

export function ImageFields({ idPrefix, draft, errors = {}, categories, onChange, disabled }: Props) {
  const altId = `${idPrefix}-alt`;
  const altHint = "Describe what's in the photo for people using screen readers, e.g. “Families browsing handmade jewellery stalls at sunset”.";
  const linkId = `${idPrefix}-link`;
  const linkHint = "The Instagram reel or post this card opens.";

  return (
    <div className="flex flex-col gap-4">
      <Field id={altId} label="Alt text" hint={altHint} error={errors.alt} counter={{ value: draft.alt.trim().length, max: 200 }}>
        <TextArea
          id={altId}
          rows={2}
          required
          value={draft.alt}
          disabled={disabled}
          invalid={Boolean(errors.alt)}
          describedBy={fieldDescribedBy(altId, altHint, errors.alt)}
          onChange={(e) => onChange({ alt: e.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-placement`} label="Shows in">
          <SelectInput
            id={`${idPrefix}-placement`}
            value={draft.placement}
            disabled={disabled}
            onChange={(e) => onChange({ placement: e.target.value as Placement })}
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {PLACEMENT_LABELS[p]}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field id={`${idPrefix}-category`} label="Category" optional>
          <SelectInput
            id={`${idPrefix}-category`}
            value={draft.category_id ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ category_id: (e.target.value || null) as CategoryId | null })}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <p className="-mt-2 text-xs text-ink-muted">{PLACEMENT_HELP[draft.placement]}</p>

      {draft.placement === "reel" ? (
        <Field id={linkId} label="Reel link" hint={linkHint} error={errors.link_url} optional>
          <TextInput
            id={linkId}
            type="url"
            inputMode="url"
            placeholder="https://www.instagram.com/reel/…"
            value={draft.link_url}
            disabled={disabled}
            invalid={Boolean(errors.link_url)}
            describedBy={fieldDescribedBy(linkId, linkHint, errors.link_url)}
            onChange={(e) => onChange({ link_url: e.target.value })}
          />
        </Field>
      ) : null}

      <Toggle
        id={`${idPrefix}-published`}
        label="Published"
        description="Hidden photos stay here but don't appear on the site."
        checked={draft.is_published}
        disabled={disabled}
        onChange={(e) => onChange({ is_published: e.target.checked })}
      />
    </div>
  );
}
