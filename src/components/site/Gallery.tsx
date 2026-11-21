import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { imagesFor } from "@/lib/content";
import type { ResolvedImage, SiteData } from "@/lib/types";
import { AutoScrollCarousel } from "./carousel/AutoScrollCarousel";

// Embla AutoScroll px per frame; reels run slower (see Reels.tsx).
const GALLERY_SPEED = 0.8;

export function Gallery({ data }: { data: SiteData }) {
  const images = imagesFor(data, "gallery");
  if (images.length === 0) return null;

  const categoryLabel = new Map(data.categories.map((c) => [c.id, c.label]));
  const tiles = images.map((img, i) => (
    <PhotoTile key={img.id} image={img} label={img.category_id ? categoryLabel.get(img.category_id) : undefined} index={i} />
  ));

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-surface pt-section pb-14 md:pb-20">
      <div className="container-site">
        <SectionHeading id="gallery-title" title={data.content.gallery_title} intro={data.content.gallery_intro} />
      </div>
      <div className="mx-auto mt-10 max-w-[100rem] px-2 md:mt-14 md:px-6">
        {images.length <= 3 ? (
          <div className="flex flex-wrap justify-center gap-5">{tiles}</div>
        ) : (
          <AutoScrollCarousel
            label="Photos from past editions"
            slides={tiles}
            speed={GALLERY_SPEED}
            direction="forward"
            minSlides={10}
            controls={{ prev: "Previous photos", next: "Next photos" }}
          />
        )}
      </div>
    </section>
  );
}

function PhotoTile({ image, label, index }: { image: ResolvedImage; label?: string; index: number }) {
  const ratio = image.width && image.height ? image.width / image.height : 4 / 5;
  // Clamp between 4:5 and 3:2 so mixed portrait/landscape photos stay a tidy, even-height strip.
  const tileRatio = Math.min(Math.max(ratio, 4 / 5), 3 / 2);

  return (
    <figure className="group rounded-lg bg-surface-card p-1.5 shadow-card transition-[transform,box-shadow] duration-[420ms] ease-out-soft hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative h-60 overflow-hidden rounded-md md:h-80" style={{ aspectRatio: tileRatio }}>
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 480px, 360px"
          loading={index < 4 ? "eager" : "lazy"}
          draggable={false}
          className="object-cover transition-transform duration-[520ms] ease-out-soft group-hover:scale-[1.04]"
        />
        {label ? (
          <figcaption className="absolute bottom-2.5 left-2.5 rounded-pill bg-surface-card/90 px-3 py-1 text-xs font-semibold text-ink">
            {label}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
