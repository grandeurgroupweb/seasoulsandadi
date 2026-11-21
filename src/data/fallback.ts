import type { Faq, ResolvedImage, SiteContent, SiteData } from "@/lib/types";
import { seedImages } from "./seed-manifest";

// Mirrors supabase/seed.sql. Used when Supabase env vars are missing or a query fails.

function seedUrl(file: string): string {
  if (file.startsWith("/")) return file;
  return `/seed/${file.replace(/^seed\//, "")}`;
}

const images: ResolvedImage[] = seedImages.map((img, i) => ({
  id: `seed-${i + 1}`,
  storage_path: img.file,
  alt: img.alt,
  category_id: img.category_id,
  placement: img.placement,
  link_url: img.placement === "reel" ? "https://www.instagram.com/seasoulsandadi" : null,
  width: img.width,
  height: img.height,
  sort_order: img.sort_order,
  is_published: true,
  url: seedUrl(img.file),
}));

const faqs: Faq[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    question: "What is Sea Soul Sandadi?",
    answer:
      "Sea Soul Sandadi is a once-a-month Sunday gathering by the sea, bringing together food, music, makers, pets, and conversations in a calm, curated space.",
    sort_order: 1,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    question: "Is it a flea market?",
    answer:
      "It's more than a flea market. It's a Sunday community experience featuring thoughtful brands, slow food, live acoustic music, and families in a beautiful setting.",
    sort_order: 2,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    question: "When is it happening?",
    answer:
      "Stay connected with us on Instagram and Facebook for announcements about upcoming editions, event dates, and exciting updates.",
    sort_order: 3,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    question: "Why are you doing this?",
    answer:
      "Vizag deserves a Sunday space where people don't rush. A place to sit, listen, eat, connect, and just be.",
    sort_order: 4,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    question: "What kind of crowd is this for?",
    answer:
      "It's for people who enjoy good food, live music, local brands, and relaxed Sunday vibes. Families, friends, and even pets are welcome!",
    sort_order: 5,
    is_published: true,
  },
];

const content: SiteContent = {
  hero_eyebrow: "A Sunday by the sea in Vizag",
  hero_title: "Sea Soul Sandadi",
  hero_tagline:
    "One Sunday a month, by the sea in Vizag. A local flea market, slow food, live music, and nobody in a hurry.",
  experience_title: "The Experience",
  experience_intro:
    "Shop the flea market from local Vizag makers, eat at shared tables, listen to live music and stay till sunset. Bring the family, and the dog.",
  edition_title: "This Month's Edition",
  gallery_title: "Event Gallery",
  gallery_intro: "A few Sundays we've spent together.",
  vendor_title: "Be a Part of Sea Soul Sandadi",
  vendor_body:
    "Are you a local brand, maker or creator in Vizag? Apply for a stall at our Sunday flea market; we keep it curated so every table gets noticed. Want to help on the day, or support an edition as a sponsor? Pick a form below and send it to us on WhatsApp.",
  vendor_cta_label: "Apply as a Vendor",
  reels_title: "From Our Instagram",
  reels_intro: "Stalls, music and people from past editions. Tap a reel to watch it on Instagram.",
  faq_title: "Frequently Asked Questions",
  faq_intro: "Quick answers before your first Sunday by the sea.",
  follow_title: "Follow Us for Updates",
  footer_tagline: "Let's build a Sunday culture together.",
  footer_about:
    "A once-a-month Sunday flea market by the sea in Vizag, for food, music, makers, pets and conversations.",
};

export const fallbackData: SiteData = {
  categories: [
    { id: "flea-market", label: "Flea Market", description: "Curated local brands, handmade pieces, lifestyle finds and slow fashion from makers around Vizag.", icon: "PiStorefront", sort_order: 1 },
    { id: "food", label: "Food Stalls", description: "Slow food at open, shared tables. Pull up a chair and take your time.", icon: "PiForkKnife", sort_order: 2 },
    { id: "music-dance", label: "Live Music & Dance", description: "Indie and acoustic sets that are easy on the soul, and dancing when the evening calls for it.", icon: "PiMusicNotes", sort_order: 3 },
    { id: "pets", label: "Pet-Friendly Space", description: "Open space to walk and sit with your pets. Families and pet parents, bring everyone.", icon: "PiPawPrint", sort_order: 4 },
    { id: "workshops", label: "Workshops & Activities", description: "Hands-on workshops for children and grown-ups. Make something, learn something, or just slow down.", icon: "PiPaintBrush", sort_order: 5 },
    { id: "photo-moments", label: "Photo Moments", description: "Sea air, evening light and corners worth a photo.", icon: "PiCamera", sort_order: 6 },
  ],
  images,
  edition: {
    id: 1,
    title: "January Edition",
    month_label: "January",
    event_date: null,
    date_announced: false,
    venue_name: "MGM Lawns",
    venue_city: "Visakhapatnam",
    map_url: "https://maps.app.goo.gl/jAHJsyymcbuvB1Ws5",
    highlights: "Shop · Eat · Music · Workshops · Kids' Workshops · More",
    theme: "sankranti",
  },
  faqs,
  settings: {
    id: 1,
    whatsapp_number: "919573435222",
    whatsapp_message:
      "Hi Sea Soul Sandadi! I'd like to set up a stall at an upcoming edition. Could you share the details?",
    instagram_url: "https://www.instagram.com/seasoulsandadi",
    facebook_url: "https://www.facebook.com/seasoulsandadi",
    email: "seasoulsandadi@gmail.com",
    phone_display: "+91 95734 35222",
  },
  content,
};
