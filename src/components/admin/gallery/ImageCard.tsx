"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { LuArrowDown, LuArrowUp, LuEye, LuEyeOff, LuPencil, LuTrash2 } from "react-icons/lu";
import { deleteImage, moveImage, setImagePublished, updateImage } from "@/lib/admin/actions/gallery";
import type { ActionResult } from "@/lib/admin/result";
import type { Category, ResolvedImage } from "@/lib/types";
import { ConfirmButton } from "../ConfirmButton";
import { useToast } from "../Toast";
import { adminButton, iconButton } from "../styles";
import { validateDraft } from "./draft";
import { ImageFields, type ImageDraft, type ImageDraftErrors } from "./ImageFields";

type Props = {
  image: ResolvedImage;
  categories: Category[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  reorderDisabledReason?: string;
};

function toDraft(image: ResolvedImage): ImageDraft {
  return {
    alt: image.alt,
    category_id: image.category_id,
    placement: image.placement,
    link_url: image.link_url ?? "",
    is_published: image.is_published,
  };
}

export function ImageCard({ image, categories, canMoveUp, canMoveDown, reorderDisabledReason }: Props) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ImageDraft>(() => toDraft(image));
  const [errors, setErrors] = useState<ImageDraftErrors>({});
  const category = categories.find((c) => c.id === image.category_id);
  const label = image.alt || "photo";

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      toast.fromResult(await action());
    });
  }

  function openEditor() {
    setDraft(toDraft(image));
    setErrors({});
    dialogRef.current?.showModal();
  }

  function save() {
    const invalid = validateDraft(draft);
    if (invalid) {
      setErrors(invalid);
      return;
    }
    startTransition(async () => {
      const result = await updateImage(image.id, draft);
      if (result.ok) {
        dialogRef.current?.close();
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors as ImageDraftErrors);
      }
      toast.fromResult(result);
    });
  }

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-lg bg-surface-card shadow-soft ${pending ? "opacity-70" : ""}`}
      aria-busy={pending || undefined}
    >
      <div className="relative aspect-[4/3] bg-sand-100">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 90vw"
          quality={70}
          className={`object-cover ${image.is_published ? "" : "opacity-50 grayscale"}`}
        />
        <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1.5">
          {!image.is_published ? (
            <span className="rounded-pill bg-sea-900 px-2.5 py-1 text-xs font-semibold text-sand-50">Hidden</span>
          ) : null}
          {category ? (
            <span className="rounded-pill bg-surface-card/95 px-2.5 py-1 text-xs font-semibold text-ink">{category.label}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <p className={`line-clamp-2 text-sm ${image.alt ? "text-ink" : "font-semibold text-terracotta-800"}`}>
          {image.alt || "Missing alt text"}
        </p>
        <div className="mt-auto flex items-center justify-between gap-1">
          <div className="flex items-center" title={reorderDisabledReason}>
            <button
              type="button"
              className={iconButton}
              aria-label={`Move “${label}” earlier`}
              disabled={!canMoveUp || pending}
              onClick={() => run(() => moveImage(image.id, "up"))}
            >
              <LuArrowUp aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label={`Move “${label}” later`}
              disabled={!canMoveDown || pending}
              onClick={() => run(() => moveImage(image.id, "down"))}
            >
              <LuArrowDown aria-hidden className="size-5" />
            </button>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className={iconButton}
              aria-label={image.is_published ? `Hide “${label}” from the site` : `Publish “${label}”`}
              title={image.is_published ? "Hide from site" : "Publish"}
              disabled={pending}
              onClick={() => run(() => setImagePublished(image.id, !image.is_published))}
            >
              {image.is_published ? <LuEye aria-hidden className="size-5" /> : <LuEyeOff aria-hidden className="size-5" />}
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label={`Edit “${label}”`}
              title="Edit"
              disabled={pending}
              onClick={openEditor}
            >
              <LuPencil aria-hidden className="size-5" />
            </button>
            <ConfirmButton
              title="Delete this photo?"
              body="It will be removed from the site and from storage. This can't be undone."
              confirmLabel="Delete photo"
              triggerLabel={`Delete “${label}”`}
              triggerClassName={`${iconButton} hover:text-terracotta-800`}
              disabled={pending}
              onConfirm={() => run(() => deleteImage(image.id))}
            >
              <LuTrash2 aria-hidden className="size-5" />
            </ConfirmButton>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`edit-${image.id}-title`}
        className="m-auto w-[min(36rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-lg bg-surface-card p-0 text-ink shadow-lift backdrop:bg-sea-950/50"
      >
        <form
          className="flex flex-col gap-5 p-5 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <h2 id={`edit-${image.id}-title`} className="text-xl font-bold">
            Edit photo
          </h2>
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-sand-100">
            <Image src={image.url} alt="" fill sizes="36rem" quality={70} className="object-contain" />
          </div>
          <ImageFields
            idPrefix={`edit-${image.id}`}
            draft={draft}
            errors={errors}
            categories={categories}
            disabled={pending}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={adminButton("ghost")} onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button type="submit" className={adminButton("primary")} disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
    </li>
  );
}
