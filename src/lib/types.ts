export type CategoryId =
  | "flea-market"
  | "food"
  | "music-dance"
  | "pets"
  | "workshops"
  | "photo-moments";

export type Placement = "gallery" | "hero" | "vendor" | "reel";

export type ContentKey =
  | "hero_eyebrow"
  | "hero_title"
  | "hero_tagline"
  | "experience_title"
  | "experience_intro"
  | "edition_title"
  | "gallery_title"
  | "gallery_intro"
  | "vendor_title"
  | "vendor_body"
  | "vendor_cta_label"
  | "reels_title"
  | "reels_intro"
  | "faq_title"
  | "faq_intro"
  | "follow_title"
  | "footer_tagline"
  | "footer_about";

export type Category = {
  id: CategoryId;
  label: string;
  description: string;
  icon: string;
  sort_order: number;
  updated_at?: string;
};

export type GalleryImage = {
  id: string;
  storage_path: string;
  alt: string;
  category_id: CategoryId | null;
  placement: Placement;
  link_url: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Edition = {
  id: 1;
  title: string;
  month_label: string;
  /** ISO date (YYYY-MM-DD) or null while the date is not announced. */
  event_date: string | null;
  date_announced: boolean;
  venue_name: string;
  venue_city: string;
  map_url: string | null;
  highlights: string;
  /** Seasonal decor id from `components/themes` ("coastal" = no theme). Optional: older rows predate the column. */
  theme?: string;
  updated_at?: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
  updated_at?: string;
};

export type SiteSettings = {
  id: 1;
  whatsapp_number: string;
  whatsapp_message: string;
  instagram_url: string;
  facebook_url: string;
  email: string;
  phone_display: string;
  updated_at?: string;
};

export type SiteContentRow = {
  key: ContentKey;
  value: string;
  label: string;
  section: string;
  sort_order: number;
  updated_at?: string;
};

export type SiteContent = Record<ContentKey, string>;

/** A photo shipped in public/seed/, used by the fallback data and the upload script. */
export type SeedImage = {
  file: string;
  alt: string;
  category_id: CategoryId | null;
  placement: Placement;
  width: number;
  height: number;
  sort_order: number;
};

/** A gallery image with its public URL resolved (Supabase Storage or /seed/...). */
export type ResolvedImage = GalleryImage & { url: string };

export type SiteData = {
  categories: Category[];
  images: ResolvedImage[];
  edition: Edition;
  faqs: Faq[];
  settings: SiteSettings;
  content: SiteContent;
};
