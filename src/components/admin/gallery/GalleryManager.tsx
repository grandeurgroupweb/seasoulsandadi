"use client";

import { useState } from "react";
import { PLACEMENT_LABELS, PLACEMENTS } from "@/lib/admin/schemas";
import type { Category, CategoryId, Placement, ResolvedImage } from "@/lib/types";
import { SelectInput } from "../Field";
import { ImageCard } from "./ImageCard";
import { PLACEMENT_HELP } from "./ImageFields";
import { UploadPanel } from "./UploadPanel";

type Filter = Placement | "all";

export function GalleryManager({ images, categories }: { images: ResolvedImage[]; categories: Category[] }) {
  const [placement, setPlacement] = useState<Filter>("all");
  const [category, setCategory] = useState<CategoryId | "">("");

  const counts = Object.fromEntries(
    PLACEMENTS.map((p) => [p, images.filter((img) => img.placement === p).length]),
  ) as Record<Placement, number>;

  const groups = (placement === "all" ? PLACEMENTS : [placement]).map((p) => {
    const all = images.filter((img) => img.placement === p);
    return { placement: p, all, visible: category ? all.filter((img) => img.category_id === category) : all };
  });

  const reorderDisabledReason = category ? "Clear the category filter to reorder" : undefined;

  return (
    <div className="flex flex-col gap-8">
      <UploadPanel categories={categories} defaultPlacement={placement === "all" ? "gallery" : placement} />

      <section aria-labelledby="library-heading" className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="library-heading" className="text-xl font-bold text-ink">
            Photo library <span className="font-normal text-ink-muted">({images.length})</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div role="group" aria-label="Filter by section" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
              {(["all", ...PLACEMENTS] as Filter[]).map((p) => {
                const active = placement === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPlacement(p)}
                    className={`min-h-10 shrink-0 rounded-pill px-4 text-sm font-semibold transition-colors ${
                      active ? "bg-sea-600 text-white" : "bg-surface-card text-ink shadow-soft hover:bg-sea-50"
                    }`}
                  >
                    {p === "all" ? "All" : PLACEMENT_LABELS[p]}{" "}
                    <span className={active ? "text-sea-100" : "text-ink-muted"}>
                      {p === "all" ? images.length : counts[p]}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="flex flex-col gap-1 sm:w-48">
              <span className="sr-only">Filter by category</span>
              <SelectInput value={category} onChange={(e) => setCategory(e.target.value as CategoryId | "")}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </div>

        {images.length === 0 ? (
          <p className="rounded-lg bg-surface-card px-5 py-10 text-center text-ink-muted shadow-soft">
            No photos yet. Upload your first one above.
          </p>
        ) : (
          groups.map(({ placement: p, all, visible }) => (
            <section key={p} aria-labelledby={`group-${p}`} className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 id={`group-${p}`} className="text-lg font-bold text-ink">
                  {PLACEMENT_LABELS[p]} <span className="font-normal text-ink-muted">({visible.length})</span>
                </h3>
                <p className="text-sm text-ink-muted">{PLACEMENT_HELP[p]} Order here is the order on the site.</p>
              </div>
              {visible.length === 0 ? (
                <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
                  {category ? "No photos in this category here." : "No photos here yet."}
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visible.map((image) => {
                    const index = all.findIndex((img) => img.id === image.id);
                    return (
                      <ImageCard
                        key={image.id}
                        image={image}
                        categories={categories}
                        canMoveUp={!category && index > 0}
                        canMoveDown={!category && index < all.length - 1}
                        reorderDisabledReason={reorderDisabledReason}
                      />
                    );
                  })}
                </ul>
              )}
            </section>
          ))
        )}
      </section>
    </div>
  );
}
