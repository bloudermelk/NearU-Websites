-- ============================================================================
-- NearU family-of-brands content platform — initial schema
--
-- Multi-tenant: every content table carries site_id. Each brand's Vercel
-- project sets one env var (SITE_SLUG) and only ever reads/writes the rows
-- for its own site. One Supabase project serves all 23 (eventually) brands.
--
-- Access model: the Next.js apps use the SERVICE ROLE key server-side only
-- (never shipped to the browser — this is a server-rendered/SSG marketing
-- site, there is no client-side Supabase usage). The service role bypasses
-- RLS by design, so RLS is enabled on every table with NO permissive
-- policies: anon/authenticated get zero access unless you deliberately add
-- a policy later (e.g. to expose a public read API).
--
-- Run this once against a fresh Supabase project (SQL Editor, or
-- `psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql`).
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- sites — one row per brand (Carolina Heating Service, and 22 others)
-- ----------------------------------------------------------------------------
create table sites (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,        -- 'carolina-heating'
  domain              text,                        -- 'carolinaheating.com'
  name                text not null,                -- 'Carolina Heating Service'
  legal_name          text not null,                -- 'Carolina Heating Service Inc.'
  tagline             text,
  phone               text,
  phone_href          text,
  email               text,
  address             jsonb not null default '{}',  -- {street, city, state, zip}
  area_served         text,
  location_label      text,
  map_url             text,
  logo_path           text,                         -- storage path or absolute URL
  founded_year        int,
  years_in_business   int,
  google_rating       numeric(2,1),
  google_review_count int,
  social              jsonb not null default '{}',  -- {facebook, instagram, linkedin, youtube}
  schedule_url        text,
  youtube_video_id    text,
  top_banner_text     text,                         -- sticky promo banner, e.g. "Order Your Home Generator!"
  top_banner_href     text,
  theme               jsonb not null default '{}',  -- brand color/font overrides, future use
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger sites_set_updated_at before update on sites
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- nav_items — recursive tree per site: top-level items, optional dropdown
-- groups (e.g. "Heating" inside "HVAC Services"), and links. `menu`
-- distinguishes the primary header nav from the footer nav.
-- ----------------------------------------------------------------------------
create table nav_items (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  parent_id   uuid references nav_items(id) on delete cascade,
  menu        text not null default 'primary' check (menu in ('primary', 'footer')),
  kind        text not null check (kind in ('top', 'group', 'link')),
  label       text,
  href        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index nav_items_site_idx on nav_items(site_id);
create index nav_items_parent_idx on nav_items(parent_id);

-- ----------------------------------------------------------------------------
-- service_categories — the top-level service pages (Heating, Cooling, ...)
-- ----------------------------------------------------------------------------
create table service_categories (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  slug         text not null,                 -- 'greenville-sc-heating'
  title        text not null,
  short_title  text,
  summary      text,
  image_path   text,
  sort_order   int not null default 0,
  unique (site_id, slug)
);
create index service_categories_site_idx on service_categories(site_id);

-- ----------------------------------------------------------------------------
-- sub_services — individual service detail pages under a category
-- (e.g. Furnaces under Heating). href is denormalized for fast lookup and
-- cross-brand nav/cross-linking.
-- ----------------------------------------------------------------------------
create table sub_services (
  id                   uuid primary key default gen_random_uuid(),
  site_id              uuid not null references sites(id) on delete cascade,
  service_category_id  uuid not null references service_categories(id) on delete cascade,
  slug                 text not null,
  title                text not null,
  description          text,
  image_path           text,
  href                 text not null,          -- '/services/greenville-sc-heating/furnaces'
  sort_order           int not null default 0,
  unique (site_id, href)
);
create index sub_services_site_idx on sub_services(site_id);
create index sub_services_category_idx on sub_services(service_category_id);

-- ----------------------------------------------------------------------------
-- locations — city/service-area landing pages
-- ----------------------------------------------------------------------------
create table locations (
  id                 uuid primary key default gen_random_uuid(),
  site_id            uuid not null references sites(id) on delete cascade,
  slug               text not null,            -- 'greer-hvac-plumbing-electrical-generators'
  city_name          text not null,
  meta_title         text,
  meta_description   text,
  hero_image_path    text,
  intro              jsonb not null default '[]',  -- string[]
  service_groups     jsonb not null default '[]',  -- [{groupIntro, items:[{title,body,href}], partnerHeading, partnerBody}]
  since_heading      text,
  since_intro        text,
  since_categories   jsonb not null default '[]',  -- [{label, bullets:[{title,body}]}]
  closing            jsonb not null default '[]',  -- string[]
  faqs               jsonb not null default '[]',  -- [{question, answer}]
  sort_order         int not null default 0,
  unique (site_id, slug)
);
create index locations_site_idx on locations(site_id);

-- ----------------------------------------------------------------------------
-- pages — generic catch-all: the hand-built homepage's structured data AND
-- every mirrored WordPress page (about, maintenance, financing, commercial,
-- blog posts, legal, promotions, etc). `data` holds structured jsonb content
-- for hand-built pages; `html`/`inline_css` hold mirrored WordPress markup.
-- A page can use either or both, per page_type.
-- ----------------------------------------------------------------------------
create table pages (
  id             uuid primary key default gen_random_uuid(),
  site_id        uuid not null references sites(id) on delete cascade,
  path           text not null,                -- '/', '/about-us', '/services/.../furnaces'
  page_type      text not null default 'mirrored' check (page_type in ('home', 'mirrored', 'blog_post', 'custom')),
  title          text,
  description    text,
  og_image_path  text,
  inline_css     text,                         -- WordPress per-page core-block-supports CSS
  html           text,                         -- mirrored <main> inner HTML
  data           jsonb,                        -- structured content for hand-built pages
  source_url     text,                         -- original URL, for re-sync provenance
  extracted_at   timestamptz,
  published_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (site_id, path)
);
create index pages_site_idx on pages(site_id);
create trigger pages_set_updated_at before update on pages
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- certifications — logo carousel ("Our Certifications & Awards")
-- ----------------------------------------------------------------------------
create table certifications (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  name        text not null,
  image_path  text not null,
  width       int,
  height      int,
  sort_order  int not null default 0
);
create index certifications_site_idx on certifications(site_id);

-- ----------------------------------------------------------------------------
-- testimonials — homepage Google reviews carousel
-- ----------------------------------------------------------------------------
create table testimonials (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  author      text not null,
  rating      int not null default 5,
  body        text not null,
  sort_order  int not null default 0
);
create index testimonials_site_idx on testimonials(site_id);

-- ----------------------------------------------------------------------------
-- redirects — mirrors the live site's redirects (next.config redirects())
-- ----------------------------------------------------------------------------
create table redirects (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  source       text not null,
  destination  text not null,
  permanent    boolean not null default true,
  unique (site_id, source)
);
create index redirects_site_idx on redirects(site_id);

-- ----------------------------------------------------------------------------
-- media_assets — tracks images mirrored/uploaded into Supabase Storage
-- ----------------------------------------------------------------------------
create table media_assets (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references sites(id) on delete cascade,
  storage_path  text not null,      -- path within the bucket, e.g. 'carolina-heating/images/2024/08/logo.png'
  original_url  text,               -- source URL if mirrored from elsewhere
  alt           text,
  width         int,
  height        int,
  created_at    timestamptz not null default now(),
  unique (site_id, storage_path)
);
create index media_assets_site_idx on media_assets(site_id);

-- ----------------------------------------------------------------------------
-- Row Level Security — enabled everywhere, no permissive policies. The
-- service_role key (used server-side only) bypasses RLS entirely. Add
-- SELECT policies later if/when you expose a public read API.
-- ----------------------------------------------------------------------------
alter table sites               enable row level security;
alter table nav_items           enable row level security;
alter table service_categories  enable row level security;
alter table sub_services        enable row level security;
alter table locations           enable row level security;
alter table pages               enable row level security;
alter table certifications      enable row level security;
alter table testimonials        enable row level security;
alter table redirects           enable row level security;
alter table media_assets        enable row level security;
