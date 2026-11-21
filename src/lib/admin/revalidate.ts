import { refresh, updateTag } from "next/cache";
import { SITE_TAG } from "@/lib/content";

/** After a successful admin write: expire the public site's cache and refresh the admin view. */
export function afterWrite() {
  updateTag(SITE_TAG);
  refresh();
}
