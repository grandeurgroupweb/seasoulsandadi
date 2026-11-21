import { ApplyDialog } from "@/components/site/apply/ApplyDialog";
import { ContactDock } from "@/components/site/ContactDock";
import { Experience } from "@/components/site/Experience";
import { FAQ } from "@/components/site/FAQ";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Header } from "@/components/site/Header";
import { HeroScrollZoom } from "@/components/site/HeroScrollZoom";
import { JsonLd } from "@/components/site/JsonLd";
import { Reels } from "@/components/site/Reels";
import { ThisEdition } from "@/components/site/ThisEdition";
import { VendorCTA } from "@/components/site/VendorCTA";
import { ThemeDecor } from "@/components/themes/ThemeDecor";
import { getSiteData } from "@/lib/content";

export default async function Home() {
  const data = await getSiteData();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-sea-900 focus:px-5 focus:py-3 focus:text-sand-50"
      >
        Skip to content
      </a>
      <Header data={data} />
      <main id="main">
        <HeroScrollZoom data={data} />
        <Experience data={data} />
        <ThisEdition data={data} />
        <Gallery data={data} />
        <VendorCTA data={data} />
        <Reels data={data} />
        <FAQ data={data} />
      </main>
      <Footer data={data} />
      <ThemeDecor theme={data.edition.theme} slot="page" />
      <ApplyDialog whatsappNumber={data.settings.whatsapp_number} />
      <ContactDock settings={data.settings} />
      <JsonLd data={data} />
    </>
  );
}
