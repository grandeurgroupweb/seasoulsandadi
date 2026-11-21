// Sankranti (January edition): kites and candle lanterns. Remove by deleting this folder
// and its line in ../index.ts; the site falls back to the coastal decor.
import type { Theme } from "..";
import { PageSky } from "./PageSky";
import { EditionDecor, FollowDecor, FooterDecor, HeroDecor } from "./slots";

export const sankranti: Theme = {
  label: "Sankranti: kites & lanterns",
  slots: { hero: HeroDecor, edition: EditionDecor, follow: FollowDecor, footer: FooterDecor, page: PageSky },
};
