-- Site Config: Nav items + Hero Banners (run this in Supabase SQL Editor)
create table if not exists public.site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.site_config enable row level security;

create policy "Public Site Config Read" on public.site_config for select using (true);
create policy "Admin Site Config All" on public.site_config for all using (true);

-- Default nav items
insert into public.site_config (key, value) values
  ('nav_items', '[
    {"label": "TÜM ÜRÜNLER", "href": "/"},
    {"label": "GİYİM", "href": "/?category=Giyim"},
    {"label": "AKSESUAR", "href": "/?category=Aksesuar"}
  ]'::jsonb),
  ('hero_banners', '[
    {"image": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop", "title": "YENİ SEZON", "buttonText": "ALIŞVERİŞE BAŞLA", "buttonLink": "/"},
    {"image": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop", "title": "AKSESUARLAR", "buttonText": "GÖZ AT", "buttonLink": "/?category=Aksesuar"}
  ]'::jsonb)
on conflict (key) do nothing;
