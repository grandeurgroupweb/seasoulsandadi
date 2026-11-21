import type { ComponentProps, ReactNode } from "react";
import { LuCircleAlert } from "react-icons/lu";
import { inputBase } from "./styles";

type FieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  counter?: { value: number; max: number };
  optional?: boolean;
  children: ReactNode;
};

export function fieldDescribedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function Field({ id, label, hint, error, counter, optional, children }: FieldProps) {
  const over = counter ? counter.value > counter.max : false;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
          {optional ? <span className="ms-1.5 font-normal text-ink-muted">(optional)</span> : null}
        </label>
        {counter ? (
          <span className={`text-xs tabular-nums ${over ? "font-semibold text-terracotta-800" : "text-ink-muted"}`}>
            {counter.value}/{counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-terracotta-800">
          <LuCircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = ComponentProps<"input"> & { invalid?: boolean; describedBy?: string };

export function TextInput({ invalid, describedBy, className = "", ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${inputBase} h-11 ${className}`}
      {...rest}
    />
  );
}

type TextAreaProps = ComponentProps<"textarea"> & { invalid?: boolean; describedBy?: string };

export function TextArea({ invalid, describedBy, className = "", rows = 3, ...rest }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${inputBase} py-2.5 leading-relaxed [field-sizing:content] min-h-20 ${className}`}
      {...rest}
    />
  );
}

type SelectProps = ComponentProps<"select"> & { invalid?: boolean; describedBy?: string };

export function SelectInput({ invalid, describedBy, className = "", children, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${inputBase} h-11 pe-8 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

type ToggleProps = Omit<ComponentProps<"input">, "type"> & { label: string; description?: string };

/** Native checkbox exposed as a switch, so keyboard and screen readers work without extra code. */
export function Toggle({ id, label, description, className = "", ...rest }: ToggleProps) {
  return (
    <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input id={id} type="checkbox" role="switch" className="peer sr-only" {...rest} />
      <span
        aria-hidden
        className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-pill bg-sand-400 transition-colors duration-200 peer-checked:bg-sea-600 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-pill after:bg-white after:shadow-soft after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
      />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {description ? <span className="text-xs text-ink-muted">{description}</span> : null}
      </span>
    </label>
  );
}
