"use client";

import { useActionState, useState } from "react";
import { LuCircleAlert, LuEye, LuEyeOff } from "react-icons/lu";
import { login, type LoginState } from "@/lib/admin/actions/auth";
import { Field, TextInput } from "./Field";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const message = state.error ?? notice;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate={false}>
      {message ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-terracotta-300 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-800"
        >
          <LuCircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {message}
        </div>
      ) : null}

      <input type="hidden" name="next" value={next ?? ""} />

      <Field id="email" label="Email">
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={state.email}
          invalid={Boolean(state.error)}
        />
      </Field>

      <Field id="password" label="Password">
        <div className="relative">
          <TextInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            invalid={Boolean(state.error)}
            className="pe-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-md text-ink-muted hover:text-ink"
          >
            {showPassword ? <LuEyeOff aria-hidden className="size-5" /> : <LuEye aria-hidden className="size-5" />}
          </button>
        </div>
      </Field>

      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
