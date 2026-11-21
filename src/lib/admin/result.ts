import type { FieldErrors } from "./schemas";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: FieldErrors };

export const SESSION_EXPIRED: ActionResult = {
  ok: false,
  error: "Your session has ended. Sign in again to keep editing.",
};

export function fail(error: string, fieldErrors?: FieldErrors): ActionResult {
  return { ok: false, error, fieldErrors };
}
