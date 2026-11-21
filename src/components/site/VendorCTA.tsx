import { SectionHeading } from "@/components/ui/SectionHeading";
import { ApplyCards } from "./apply/ApplyCards";
import type { ResolvedImage, SiteData } from "@/lib/types";
import { PolaroidLine, type PolaroidSlide } from "./sections/PolaroidLine";
import { Reveal } from "./sections/Reveal";

const MAX_PRINTS = 8;

// Handwritten labels for the prints, matched against the photo's alt text.
// Each print takes the first matching label not already used, so neighbours never repeat.
const NOTE_RULES: [RegExp, string][] = [
  [/necklace|gold/i, "Heirloom gold"],
  [/rings|bangles/i, "Rings & bangles"],
  [/handloom|brass/i, "Handloom & brass"],
  [/jars|plants|handmade goods/i, "Handmade goods"],
  [/décor|decor/i, "Handmade décor"],
  [/accessories/i, "Accessories"],
  [/kurta|clothing|garment/i, "Slow fashion"],
  [/rows|canop/i, "Under the canopies"],
  [/jewellery/i, "Jewellery & more"],
  [/stall/i, "Local makers"],
];

function noteFor(img: ResolvedImage, used: Set<string>, fallback: string) {
  const note = NOTE_RULES.find(([re, label]) => re.test(img.alt) && !used.has(label))?.[1] ?? fallback;
  used.add(note);
  return note;
}

const fileKey = (img: ResolvedImage) => img.storage_path.split("/").pop() ?? img.id;

// Vendor photos first, topped up with flea-market gallery shots for a fuller string.
function stallPrints(data: SiteData): PolaroidSlide[] {
  const fallback = data.categories.find((c) => c.id === "flea-market")?.label ?? "Our stalls";
  const vendor = data.images.filter((img) => img.placement === "vendor");
  const extra = data.images.filter((img) => img.placement === "gallery" && img.category_id === "flea-market");
  const seen = new Set<string>();
  const picked: ResolvedImage[] = [];
  for (const img of [...vendor, ...extra]) {
    const key = fileKey(img);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(img);
    if (picked.length === MAX_PRINTS) break;
  }
  const used = new Set<string>();
  return picked.map((img) => ({ src: img.url, alt: img.alt, note: noteFor(img, used, fallback), caption: img.alt }));
}

export function VendorCTA({ data }: { data: SiteData }) {
  const prints = stallPrints(data);
  const { content } = data;

  return (
    <section id="vendors" aria-labelledby="vendors-title" className="bg-surface-raised pt-16 pb-10 md:pt-24 md:pb-14">
      <div className="container-site">
        <Reveal className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="vendors-title"
              title={content.vendor_title}
              align="start"
              className="max-w-none"
            />
            <p className="max-w-prose text-lg text-ink-muted">{content.vendor_body}</p>
          </div>
          {/* Each opens its form (ApplyDialog); sending the form opens WhatsApp. */}
          <div className="lg:pb-1">
            <ApplyCards vendorLabel={content.vendor_cta_label} />
          </div>
        </Reveal>
      </div>

      {prints.length ? (
        <Reveal delay={0.1} className="mx-auto mt-8 max-w-[100rem] px-2 md:mt-10 md:px-6">
          <PolaroidLine slides={prints} label="Stalls from past editions" className="h-[28rem] md:h-[34rem]" />
        </Reveal>
      ) : null}
    </section>
  );
}
