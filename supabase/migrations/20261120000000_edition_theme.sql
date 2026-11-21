-- Seasonal decor for the current edition. 'coastal' = the everyday look; other ids live in
-- src/components/themes/. Unknown ids render as coastal, so removing a theme folder never breaks the site.
alter table public.editions
  add column if not exists theme text not null default 'coastal';
