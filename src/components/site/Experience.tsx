import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteData } from "@/lib/types";
import { ExperiencePanels, type ExperienceCategory } from "./sections/ExperiencePanels";
import { Reveal } from "./sections/Reveal";

export function Experience({ data }: { data: SiteData }) {
  const categories: ExperienceCategory[] = data.categories.map((category) => ({
    id: category.id,
    label: category.label,
    description: category.description,
    icon: category.icon,
    photos: data.images
      .filter((img) => img.placement === "gallery" && img.category_id === category.id)
      .map((img) => ({ url: img.url, alt: img.alt })),
  }));

  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y bg-surface">
      <div className="container-site flex flex-col gap-12">
        <Reveal>
          <SectionHeading
            id="experience-title"
            title={data.content.experience_title}
            intro={data.content.experience_intro}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <ExperiencePanels categories={categories} />
        </Reveal>
      </div>
    </section>
  );
}
