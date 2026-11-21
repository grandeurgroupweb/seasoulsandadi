import type { adminClientForAction } from "./auth";

type Client = NonNullable<Awaited<ReturnType<typeof adminClientForAction>>>;

/**
 * Moves one row up or down within an ordered list and rewrites sort_order as 1..n,
 * which also heals duplicate or gapped orders left by earlier edits.
 */
export async function moveRow(
  supabase: Client,
  table: "gallery_images" | "faqs",
  rows: { id: string }[],
  id: string,
  direction: "up" | "down",
): Promise<string | null> {
  const from = rows.findIndex((r) => r.id === id);
  if (from === -1) return "That item no longer exists. Refresh the page.";
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= rows.length) return null;

  const ordered = [...rows];
  [ordered[from], ordered[to]] = [ordered[to], ordered[from]];

  const results = await Promise.all(
    ordered.map((row, index) => supabase.from(table).update({ sort_order: index + 1 }).eq("id", row.id)),
  );
  const failed = results.find((r) => r.error);
  return failed?.error ? "Couldn't save the new order. Try again." : null;
}
