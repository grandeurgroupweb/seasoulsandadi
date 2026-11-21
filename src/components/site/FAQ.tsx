import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteData } from "@/lib/types";
import { FollowCard } from "./follow/FollowCard";
import { FaqAccordion } from "./sections/FaqAccordion";
import { Reveal } from "./sections/Reveal";

export function FAQ({ data }: { data: SiteData }) {
  const items = data.faqs.map(({ id, question, answer }) => ({ id, question, answer }));

  return (
    <section id="faq" aria-labelledby="faq-title" className="overflow-x-clip bg-surface-raised pb-32 pt-section sm:pb-40">
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="faq-title"
            title={data.content.faq_title}
            intro={data.content.faq_intro || undefined}
            align="start"
            className="max-w-none"
          />
          {items.length ? (
            <Reveal delay={0.1}>
              <FaqAccordion items={items} />
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.15} className="lg:sticky lg:top-28 lg:self-start">
          <FollowCard data={data} />
        </Reveal>
      </div>
    </section>
  );
}
