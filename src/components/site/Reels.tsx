import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialButton } from "@/components/ui/SocialButton";
import { imagesFor } from "@/lib/content";
import type { SiteData } from "@/lib/types";
import { ReelsCoverflow } from "./carousel/ReelsCoverflow";
import { Reveal } from "./sections/Reveal";

function instagramHandle(url: string) {
  const handle = url.replace(/\/+$/, "").split("/").pop();
  return handle ? `@${handle}` : "us";
}

export function Reels({ data }: { data: SiteData }) {
  const profile = data.settings.instagram_url;
  const reels = imagesFor(data, "reel").map((reel) => ({
    id: reel.id,
    url: reel.url,
    alt: reel.alt || "Watch on Instagram",
    href: reel.link_url ?? profile,
  }));

  return (
    <section id="reels" aria-labelledby="reels-title" className="overflow-x-clip bg-surface pt-16 pb-section md:pt-24">
      <div className="container-site">
        <SectionHeading id="reels-title" title={data.content.reels_title} intro={data.content.reels_intro} />
      </div>

      {reels.length ? (
        <Reveal delay={0.1} className="container-site mt-8 md:mt-10">
          <ReelsCoverflow reels={reels} label="Reels from our Instagram" />
        </Reveal>
      ) : null}

      <Reveal delay={0.15} className="container-site mt-8 flex justify-center">
        <SocialButton platform="instagram" href={profile} size="lg">
          Follow {instagramHandle(profile)} on Instagram
        </SocialButton>
      </Reveal>
    </section>
  );
}
