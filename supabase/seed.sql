-- Sea Soul Sandadi: initial content. Safe to re-run (upserts).
-- Gallery images are not seeded here: scripts/seed-images uploads them from public/seed/.

insert into public.categories (id, label, description, icon, sort_order) values
  ('flea-market',   'Flea Market',            'Curated local brands, handmade pieces, lifestyle finds and slow fashion from makers around Vizag.', 'PiStorefront', 1),
  ('food',          'Food Stalls',            'Slow food at open, shared tables. Pull up a chair and take your time.',                            'PiForkKnife',  2),
  ('music-dance',   'Live Music & Dance',     'Indie and acoustic sets that are easy on the soul, and dancing when the evening calls for it.',   'PiMusicNotes', 3),
  ('pets',          'Pet-Friendly Space',     'Open space to walk and sit with your pets. Families and pet parents, bring everyone.',            'PiPawPrint',   4),
  ('workshops',     'Workshops & Activities', 'Hands-on workshops for children and grown-ups. Make something, learn something, or just slow down.',              'PiPaintBrush', 5),
  ('photo-moments', 'Photo Moments',          'Sea air, evening light and corners worth a photo.',                                                'PiCamera',     6)
on conflict (id) do update
  set label = excluded.label,
      description = excluded.description,
      icon = excluded.icon,
      sort_order = excluded.sort_order;

insert into public.editions (id, title, month_label, event_date, date_announced, venue_name, venue_city, map_url, highlights)
values (1, 'January Edition', 'January', null, false, 'MGM Lawns', 'Visakhapatnam', 'https://maps.app.goo.gl/jAHJsyymcbuvB1Ws5','Shop · Eat · Music · Workshops · Kids'' Workshops · More')
on conflict (id) do update
  set title = excluded.title,
      month_label = excluded.month_label,
      event_date = excluded.event_date,
      date_announced = excluded.date_announced,
      venue_name = excluded.venue_name,
      venue_city = excluded.venue_city,
      map_url = excluded.map_url,
      highlights = excluded.highlights;

insert into public.site_settings (id, whatsapp_number, whatsapp_message, instagram_url, facebook_url, email, phone_display)
values (
  1,
  '919573435222',
  'Hi Sea Soul Sandadi! I''d like to set up a stall at an upcoming edition. Could you share the details?',
  'https://www.instagram.com/seasoulsandadi',
  'https://www.facebook.com/seasoulsandadi',
  'seasoulsandadi@gmail.com',
  '+91 95734 35222'
)
on conflict (id) do update
  set whatsapp_number = excluded.whatsapp_number,
      whatsapp_message = excluded.whatsapp_message,
      instagram_url = excluded.instagram_url,
      facebook_url = excluded.facebook_url,
      email = excluded.email,
      phone_display = excluded.phone_display;

-- FAQs: fixed ids so re-running the seed updates instead of duplicating.
insert into public.faqs (id, question, answer, sort_order, is_published) values
  ('00000000-0000-4000-8000-000000000001',
   'What is Sea Soul Sandadi?',
   'Sea Soul Sandadi is a once-a-month Sunday gathering by the sea, bringing together food, music, makers, pets, and conversations in a calm, curated space.',
   1, true),
  ('00000000-0000-4000-8000-000000000002',
   'Is it a flea market?',
   'It''s more than a flea market. It''s a Sunday community experience featuring thoughtful brands, slow food, live acoustic music, and families in a beautiful setting.',
   2, true),
  ('00000000-0000-4000-8000-000000000003',
   'When is it happening?',
   'Stay connected with us on Instagram and Facebook for announcements about upcoming editions, event dates, and exciting updates.',
   3, true),
  ('00000000-0000-4000-8000-000000000004',
   'Why are you doing this?',
   'Vizag deserves a Sunday space where people don''t rush. A place to sit, listen, eat, connect, and just be.',
   4, true),
  ('00000000-0000-4000-8000-000000000005',
   'What kind of crowd is this for?',
   'It''s for people who enjoy good food, live music, local brands, and relaxed Sunday vibes. Families, friends, and even pets are welcome!',
   5, true)
on conflict (id) do update
  set question = excluded.question,
      answer = excluded.answer,
      sort_order = excluded.sort_order,
      is_published = excluded.is_published;

insert into public.site_content (key, value, label, section, sort_order) values
  ('hero_eyebrow',     'A Sunday by the sea in Vizag',                                                                                              'Hero eyebrow',              'hero',       1),
  ('hero_title',       'Sea Soul Sandadi',                                                                                                          'Hero title',                'hero',       2),
  ('hero_tagline',     'One Sunday a month, by the sea in Vizag. A local flea market, slow food, live music, and nobody in a hurry.',                       'Hero tagline',              'hero',       3),
  ('experience_title', 'The Experience',                                                                                                            'Experience title',          'experience', 1),
  ('experience_intro', 'Shop the flea market from local Vizag makers, eat at shared tables, listen to live music and stay till sunset. Bring the family, and the dog.',  'Experience intro',          'experience', 2),
  ('edition_title',    'This Month''s Edition',                                                                                                     'Edition section title',     'edition',    1),
  ('gallery_title',    'Event Gallery',                                                                                                             'Gallery title',             'gallery',    1),
  ('gallery_intro',    'A few Sundays we''ve spent together.',                                                                                      'Gallery intro',             'gallery',    2),
  ('vendor_title',     'Be a Part of Sea Soul Sandadi',                                                                                             'Vendor section title',      'vendor',     1),
  ('vendor_body',      'Are you a local brand, maker or creator in Vizag? Apply for a stall at our Sunday flea market; we keep it curated so every table gets noticed. Want to help on the day, or support an edition as a sponsor? Pick a form below and send it to us on WhatsApp.', 'Vendor section text', 'vendor', 2),
  ('vendor_cta_label', 'Apply as a Vendor',                                                                                                         'Vendor button label',       'vendor',     3),
  ('reels_title',      'From Our Instagram',                                                                                                    'Reels title',               'reels',      1),
  ('reels_intro',      'Stalls, music and people from past editions. Tap a reel to watch it on Instagram.',                                        'Reels intro',               'reels',      2),
  ('faq_title',        'Frequently Asked Questions',                                                                                                'FAQ title',                 'faq',        1),
  ('faq_intro',        'Quick answers before your first Sunday by the sea.',                                                                        'FAQ intro',                 'faq',        2),
  ('follow_title',     'Follow Us for Updates',                                                                                                     'Follow section title',      'follow',     1),
  ('footer_tagline',   'Let''s build a Sunday culture together.',                                                                                   'Footer tagline',            'footer',     1),
  ('footer_about',     'A once-a-month Sunday flea market by the sea in Vizag, for food, music, makers, pets and conversations.',                    'Footer about text',         'footer',     2)
on conflict (key) do update
  set value = excluded.value,
      label = excluded.label,
      section = excluded.section,
      sort_order = excluded.sort_order;
