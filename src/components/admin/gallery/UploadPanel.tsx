"use client";

import { useEffect, useRef, useState } from "react";
import { LuCircleAlert, LuCircleCheck, LuImageUp, LuLoaderCircle, LuTrash2, LuUpload } from "react-icons/lu";
import { createImage } from "@/lib/admin/actions/gallery";
import { resizeImage } from "@/lib/admin/resize-image";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, PLACEMENT_FOLDERS } from "@/lib/admin/schemas";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import type { Category, Placement } from "@/lib/types";
import { useToast } from "../Toast";
import { adminButton, iconButton, panel } from "../styles";
import { validateDraft } from "./draft";
import { ImageFields, type ImageDraft, type ImageDraftErrors } from "./ImageFields";

type Status = "ready" | "resizing" | "uploading" | "saving" | "done" | "error";

type QueueItem = {
  key: string;
  file: File;
  previewUrl: string;
  draft: ImageDraft;
  errors: ImageDraftErrors;
  status: Status;
  message?: string;
};

const STATUS_LABEL: Record<Status, string> = {
  ready: "Ready",
  resizing: "Resizing…",
  uploading: "Uploading…",
  saving: "Saving…",
  done: "Added",
  error: "Failed",
};

const STATUS_PROGRESS: Record<Status, number> = {
  ready: 0,
  resizing: 25,
  uploading: 60,
  saving: 90,
  done: 100,
  error: 100,
};

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function UploadPanel({ categories, defaultPlacement }: { categories: Category[]; defaultPlacement: Placement }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => () => queueRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl)), []);

  function update(key: string, patch: Partial<QueueItem>) {
    setQueue((all) => all.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function addFiles(files: FileList | File[]) {
    const accepted: QueueItem[] = [];
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
        problems.push(`${file.name}: only JPG, PNG or WebP photos can be uploaded.`);
      } else if (file.size > MAX_UPLOAD_BYTES) {
        problems.push(`${file.name}: ${formatSize(file.size)} is over the 40 MB limit.`);
      } else {
        accepted.push({
          key: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          draft: { alt: "", category_id: null, placement: defaultPlacement, link_url: "", is_published: true },
          errors: {},
          status: "ready",
        });
      }
    }
    setRejected(problems);
    if (accepted.length) setQueue((all) => [...all, ...accepted]);
  }

  function remove(key: string) {
    setQueue((all) => {
      const item = all.find((i) => i.key === key);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return all.filter((i) => i.key !== key);
    });
  }

  function clearFinished() {
    setQueue((all) => {
      all.filter((i) => i.status === "done").forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return all.filter((i) => i.status !== "done");
    });
  }

  async function uploadOne(item: QueueItem, supabase: ReturnType<typeof createClient>) {
    let storagePath: string | null = null;
    try {
      update(item.key, { status: "resizing", message: undefined });
      const resized = await resizeImage(item.file);

      storagePath = `${PLACEMENT_FOLDERS[item.draft.placement]}/${crypto.randomUUID()}.${resized.extension}`;
      update(item.key, { status: "uploading" });
      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, resized.blob, {
        contentType: resized.blob.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (uploadError) throw new Error("The upload didn't go through. Check your connection and retry.");

      update(item.key, { status: "saving" });
      const result = await createImage({
        meta: item.draft,
        storage_path: storagePath,
        width: resized.width,
        height: resized.height,
      });
      if (!result.ok) {
        // Don't leave an orphaned file in the bucket when the row couldn't be created.
        await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
        throw new Error(result.error);
      }
      update(item.key, { status: "done" });
      return true;
    } catch (err) {
      update(item.key, {
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong with this photo.",
      });
      return false;
    }
  }

  async function uploadAll() {
    const pending = queue.filter((i) => i.status === "ready" || i.status === "error");
    let firstInvalid: string | null = null;
    const valid: QueueItem[] = [];
    for (const item of pending) {
      const errors = validateDraft(item.draft);
      update(item.key, { errors: errors ?? {} });
      if (errors) firstInvalid ??= item.key;
      else valid.push(item);
    }
    if (firstInvalid) {
      document.getElementById(`upload-${firstInvalid}-alt`)?.focus();
      toast.error("Some photos need alt text before they can be uploaded.");
      if (!valid.length) return;
    }

    setRunning(true);
    const supabase = createClient();
    let added = 0;
    // One at a time: decoding 20–40 MB camera files in parallel can exhaust memory on phones.
    for (const item of valid) {
      if (await uploadOne(item, supabase)) added += 1;
    }
    setRunning(false);
    if (added) toast.success(added === 1 ? "1 photo added" : `${added} photos added`);
    if (added < valid.length) toast.error("Some photos failed. Check the list and retry.");
  }

  const waiting = queue.filter((i) => i.status === "ready" || i.status === "error").length;
  const finished = queue.filter((i) => i.status === "done").length;

  return (
    <section aria-labelledby="upload-heading" className={`${panel} flex flex-col gap-5 p-5 sm:p-6`}>
      <div className="flex flex-col gap-1">
        <h2 id="upload-heading" className="text-xl font-bold text-ink">
          Add photos
        </h2>
        <p className="text-sm text-ink-muted">
          Photos are resized to 2000 px and converted in your browser before upload, which also removes camera and
          location data.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragging ? "border-terracotta-500 bg-terracotta-50" : "border-sea-300 bg-sea-50"
        }`}
      >
        <LuImageUp aria-hidden className="size-9 text-sea-600" />
        <p className="text-base font-semibold text-ink">Drop photos here or</p>
        <button type="button" className={adminButton("secondary")} onClick={() => inputRef.current?.click()} disabled={running}>
          <LuUpload aria-hidden className="size-4" />
          Choose photos
        </button>
        <p className="text-xs text-ink-muted">JPG, PNG or WebP, up to 40 MB each. You can pick several at once.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES.join(",")}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rejected.length ? (
        <ul role="alert" className="flex flex-col gap-1 rounded-md bg-terracotta-50 px-4 py-3 text-sm text-terracotta-800">
          {rejected.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <LuCircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      ) : null}

      {queue.length ? (
        <>
          <ul className="flex flex-col gap-4">
            {queue.map((item) => {
              const busy = item.status === "resizing" || item.status === "uploading" || item.status === "saving";
              const locked = busy || item.status === "done" || running;
              return (
                <li key={item.key} className="flex flex-col gap-4 rounded-md border border-line p-4 md:flex-row">
                  <div className="flex shrink-0 flex-row gap-3 md:w-40 md:flex-col">
                    {/* Local blob preview; next/image can't optimize object URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="aspect-[4/3] w-28 rounded-sm bg-sand-100 object-cover md:w-full"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="truncate text-xs font-medium text-ink" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-xs text-ink-muted">{formatSize(item.file.size)}</p>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <ImageFields
                      idPrefix={`upload-${item.key}`}
                      draft={item.draft}
                      errors={item.errors}
                      categories={categories}
                      disabled={locked}
                      onChange={(patch) => update(item.key, { draft: { ...item.draft, ...patch } })}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5" aria-live="polite">
                        <p
                          className={`flex items-center gap-1.5 text-sm font-medium ${
                            item.status === "error" ? "text-terracotta-800" : "text-ink"
                          }`}
                        >
                          {busy ? <LuLoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
                          {item.status === "done" ? <LuCircleCheck aria-hidden className="size-4 text-sea-600" /> : null}
                          {item.status === "error" ? <LuCircleAlert aria-hidden className="size-4" /> : null}
                          {STATUS_LABEL[item.status]}
                          {item.message ? <span className="font-normal">— {item.message}</span> : null}
                        </p>
                        {item.status !== "ready" ? (
                          <div
                            role="progressbar"
                            aria-label={`Upload progress for ${item.file.name}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={STATUS_PROGRESS[item.status]}
                            className="h-1.5 w-full max-w-xs overflow-hidden rounded-pill bg-sand-200"
                          >
                            <div
                              className={`h-full rounded-pill transition-[width] duration-500 ${
                                item.status === "error" ? "bg-terracotta-800" : "bg-sea-600"
                              }`}
                              style={{ width: `${STATUS_PROGRESS[item.status]}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                      {item.status !== "done" ? (
                        <button
                          type="button"
                          className={iconButton}
                          disabled={busy || running}
                          aria-label={`Remove ${item.file.name} from the list`}
                          title="Remove from list"
                          onClick={() => remove(item.key)}
                        >
                          <LuTrash2 aria-hidden className="size-5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {finished ? (
              <button type="button" className={adminButton("ghost")} onClick={clearFinished} disabled={running}>
                Clear finished
              </button>
            ) : null}
            <button type="button" className={adminButton("primary")} onClick={uploadAll} disabled={running || !waiting}>
              {running ? <LuLoaderCircle aria-hidden className="size-4 animate-spin" /> : <LuUpload aria-hidden className="size-4" />}
              {running ? "Uploading…" : waiting === 1 ? "Upload 1 photo" : `Upload ${waiting} photos`}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
