-- Sea Soul Sandadi: initial schema, RLS and storage.
--
-- Granting the admin (one-time, after this migration runs):
--   1. Supabase dashboard -> Authentication -> Users -> "Add user" (email + password).
--   2. Authentication -> Sign In / Providers -> turn OFF "Allow new users to sign up".
--   3. SQL editor:  insert into public.admins (user_id)
--                   select id from auth.users where email = '<admin email>';
-- Signing in alone grants nothing: every write policy checks public.is_admin().

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Defined after admins exists; security definer so RLS on admins does not recurse.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.categories (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  label       text not null,
  description text not null default '',
  icon        text not null default '',
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt          text not null default '',
  category_id  text references public.categories (id) on update cascade on delete set null,
  placement    text not null default 'gallery'
               check (placement in ('gallery', 'hero', 'vendor', 'reel')),
  link_url     text check (link_url is null or link_url ~ '^https://'),
  width        integer check (width is null or width > 0),
  height       integer check (height is null or height > 0),
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.editions (
  id             integer primary key default 1 check (id = 1),
  title          text not null default '',
  month_label    text not null default '',
  event_date     date,
  date_announced boolean not null default false,
  venue_name     text not null default '',
  venue_city     text not null default '',
  map_url        text check (map_url is null or map_url ~ '^https://'),
  highlights     text not null default '',
  updated_at     timestamptz not null default now()
);

create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  updated_at   timestamptz not null default now()
);

create table if not exists public.site_settings (
  id               integer primary key default 1 check (id = 1),
  whatsapp_number  text not null default '' check (whatsapp_number ~ '^[0-9]*$'),
  whatsapp_message text not null default '',
  instagram_url    text not null default '',
  facebook_url     text not null default '',
  email            text not null default '',
  phone_display    text not null default '',
  updated_at       timestamptz not null default now()
);

create table if not exists public.site_content (
  key        text primary key check (key ~ '^[a-z0-9_]+$'),
  value      text not null default '',
  label      text not null default '',
  section    text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists gallery_images_placement_sort_idx
  on public.gallery_images (placement, sort_order);
create index if not exists gallery_images_category_idx
  on public.gallery_images (category_id);
create index if not exists categories_sort_idx on public.categories (sort_order);
create index if not exists faqs_sort_idx on public.faqs (sort_order);
create index if not exists site_content_section_sort_idx
  on public.site_content (section, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'gallery_images', 'editions', 'faqs', 'site_settings', 'site_content']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admins         enable row level security;
alter table public.categories     enable row level security;
alter table public.gallery_images enable row level security;
alter table public.editions       enable row level security;
alter table public.faqs           enable row level security;
alter table public.site_settings  enable row level security;
alter table public.site_content   enable row level security;

-- admins: an admin can see their own row; no client writes (manage via SQL editor).
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Public read: whole table for single-row/config tables, published rows otherwise.
-- Admins also read unpublished rows so the admin panel can list them.
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "editions_public_read" on public.editions;
create policy "editions_public_read" on public.editions
  for select to anon, authenticated using (true);

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "gallery_images_public_read" on public.gallery_images;
create policy "gallery_images_public_read" on public.gallery_images
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));

-- Admin writes on every content table.
do $$
declare
  t text;
begin
  foreach t in array array['categories', 'gallery_images', 'editions', 'faqs', 'site_settings', 'site_content']
  loop
    execute format('drop policy if exists "%s_admin_insert" on public.%I', t, t);
    execute format('drop policy if exists "%s_admin_update" on public.%I', t, t);
    execute format('drop policy if exists "%s_admin_delete" on public.%I', t, t);
    execute format(
      'create policy "%s_admin_insert" on public.%I for insert to authenticated
         with check ((select public.is_admin()))', t, t);
    execute format(
      'create policy "%s_admin_update" on public.%I for update to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t, t);
    execute format(
      'create policy "%s_admin_delete" on public.%I for delete to authenticated
         using ((select public.is_admin()))', t, t);
  end loop;
end;
$$;

-- Single-row tables must never lose their row through the API.
drop policy if exists "editions_admin_delete" on public.editions;
drop policy if exists "site_settings_admin_delete" on public.site_settings;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket "media" (folders gallery/, hero/, vendor/, reels/, logo/)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (select public.is_admin())
    and (storage.foldername(name))[1] in ('gallery', 'hero', 'vendor', 'reels', 'logo')
  );

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
