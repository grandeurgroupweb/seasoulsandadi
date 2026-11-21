"use client";

import { useState, useTransition } from "react";
import { LuArrowDown, LuArrowUp, LuEye, LuEyeOff, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { deleteFaq, moveFaq, saveFaq, setFaqPublished } from "@/lib/admin/actions/faq";
import type { ActionResult } from "@/lib/admin/result";
import { faqSchema, toFieldErrors, type FieldErrors } from "@/lib/admin/schemas";
import type { Faq } from "@/lib/types";
import { ConfirmButton } from "./ConfirmButton";
import { Field, fieldDescribedBy, TextArea, TextInput, Toggle } from "./Field";
import { useToast } from "./Toast";
import { adminButton, iconButton, panel } from "./styles";

type Draft = { question: string; answer: string; is_published: boolean };

function FaqEditor({
  idPrefix,
  initial,
  submitLabel,
  onSave,
  onCancel,
}: {
  idPrefix: string;
  initial: Draft;
  submitLabel: string;
  onSave: (draft: Draft) => Promise<ActionResult>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const qId = `${idPrefix}-question`;
  const aId = `${idPrefix}-answer`;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = faqSchema.safeParse(draft);
        if (!parsed.success) {
          const fieldErrors = toFieldErrors(parsed.error);
          setErrors(fieldErrors);
          document.getElementById(fieldErrors.question ? qId : aId)?.focus();
          return;
        }
        setErrors({});
        startTransition(async () => {
          const result = await onSave(draft);
          if (!result.ok && result.fieldErrors) setErrors(result.fieldErrors);
        });
      }}
    >
      <Field id={qId} label="Question" error={errors.question} counter={{ value: draft.question.trim().length, max: 200 }}>
        <TextInput
          id={qId}
          value={draft.question}
          disabled={pending}
          invalid={Boolean(errors.question)}
          describedBy={fieldDescribedBy(qId, undefined, errors.question)}
          onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
        />
      </Field>
      <Field
        id={aId}
        label="Answer"
        hint="Plain text. Line breaks are kept."
        error={errors.answer}
        counter={{ value: draft.answer.trim().length, max: 1000 }}
      >
        <TextArea
          id={aId}
          rows={4}
          value={draft.answer}
          disabled={pending}
          invalid={Boolean(errors.answer)}
          describedBy={fieldDescribedBy(aId, "Plain text. Line breaks are kept.", errors.answer)}
          onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))}
        />
      </Field>
      <Toggle
        id={`${idPrefix}-published`}
        label="Published"
        description="Unpublished questions stay here but are hidden on the site."
        checked={draft.is_published}
        disabled={pending}
        onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className={adminButton("ghost")} onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button type="submit" className={adminButton("primary")} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FaqRow({ faq, index, total }: { faq: Faq; index: number; total: number }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      toast.fromResult(await action());
    });

  return (
    <li className={`${panel} p-4 sm:p-5 ${pending ? "opacity-70" : ""}`} aria-busy={pending || undefined}>
      {editing ? (
        <FaqEditor
          idPrefix={`faq-${faq.id}`}
          initial={{ question: faq.question, answer: faq.answer, is_published: faq.is_published }}
          submitLabel="Save question"
          onCancel={() => setEditing(false)}
          onSave={async (draft) => {
            const result = await saveFaq(faq.id, draft);
            toast.fromResult(result);
            if (result.ok) setEditing(false);
            return result;
          }}
        />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <span className="text-lg font-bold text-terracotta-800 tabular-nums">{index + 1}.</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-ink">
              {faq.question}
              {!faq.is_published ? (
                <span className="rounded-pill bg-sea-900 px-2.5 py-0.5 text-xs font-semibold text-sand-50">Hidden</span>
              ) : null}
            </p>
            <p className="line-clamp-3 whitespace-pre-line text-sm text-ink-muted">{faq.answer}</p>
          </div>
          <div className="flex shrink-0 items-center justify-end">
            <button
              type="button"
              className={iconButton}
              aria-label={`Move question ${index + 1} up`}
              disabled={index === 0 || pending}
              onClick={() => run(() => moveFaq(faq.id, "up"))}
            >
              <LuArrowUp aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label={`Move question ${index + 1} down`}
              disabled={index === total - 1 || pending}
              onClick={() => run(() => moveFaq(faq.id, "down"))}
            >
              <LuArrowDown aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label={faq.is_published ? `Hide question ${index + 1} from the site` : `Publish question ${index + 1}`}
              title={faq.is_published ? "Hide from site" : "Publish"}
              disabled={pending}
              onClick={() => run(() => setFaqPublished(faq.id, !faq.is_published))}
            >
              {faq.is_published ? <LuEye aria-hidden className="size-5" /> : <LuEyeOff aria-hidden className="size-5" />}
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label={`Edit question ${index + 1}`}
              title="Edit"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              <LuPencil aria-hidden className="size-5" />
            </button>
            <ConfirmButton
              title="Delete this question?"
              body={`“${faq.question}” will be removed from the site. This can't be undone.`}
              confirmLabel="Delete question"
              triggerLabel={`Delete question ${index + 1}`}
              triggerClassName={`${iconButton} hover:text-terracotta-800`}
              disabled={pending}
              onConfirm={() => run(() => deleteFaq(faq.id))}
            >
              <LuTrash2 aria-hidden className="size-5" />
            </ConfirmButton>
          </div>
        </div>
      )}
    </li>
  );
}

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {adding ? (
        <section aria-label="New question" className={`${panel} p-5 sm:p-6`}>
          <h2 className="mb-4 text-xl font-bold text-ink">New question</h2>
          <FaqEditor
            idPrefix="faq-new"
            initial={{ question: "", answer: "", is_published: true }}
            submitLabel="Add question"
            onCancel={() => setAdding(false)}
            onSave={async (draft) => {
              const result = await saveFaq(null, draft);
              toast.fromResult(result);
              if (result.ok) setAdding(false);
              return result;
            }}
          />
        </section>
      ) : (
        <div className="flex justify-end">
          <button type="button" className={adminButton("primary")} onClick={() => setAdding(true)}>
            <LuPlus aria-hidden className="size-4" />
            Add question
          </button>
        </div>
      )}

      {faqs.length === 0 ? (
        <p className={`${panel} px-5 py-10 text-center text-ink-muted`}>No questions yet. Add the first one.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <FaqRow key={faq.id} faq={faq} index={i} total={faqs.length} />
          ))}
        </ol>
      )}
    </div>
  );
}
