-- ============================================================================
-- NearU Websites — FULL DATABASE SCHEMA (generated: concatenation of
-- supabase/migrations/*.sql in order). Use this to set up a brand-new Supabase
-- project in one paste. On an existing project, run only the migrations you
-- have not applied yet (they are idempotent where possible).
--
-- Tenancy model:
--   companies (NearU)  1 --< sites (one row per brand website)  1 --< everything else (site_id)
-- All access is server-side with the service_role key; RLS is enabled with no
-- permissive policies, so the anon key can read nothing.
-- ============================================================================


-- ############################################################################
-- 0001_init.sql
-- ############################################################################

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

-- ############################################################################
-- 0002_integrations.sql
-- ############################################################################

-- ============================================================================
-- Third-party integration config, per site. All nullable — a brand with no
-- values set here simply renders nothing for that integration (safe default
-- for prototypes/staging; fill in when actually going live for a brand).
-- ============================================================================

alter table sites add column if not exists scheduler_id text;       -- ServiceTitan `data-schedulerid`
alter table sites add column if not exists scheduler_api_key text;  -- ServiceTitan `data-api-key`
alter table sites add column if not exists gtm_id text;             -- Google Tag Manager container, e.g. 'GTM-XXXXXXX'
alter table sites add column if not exists tealium_src text;        -- Full utag.js URL, e.g. https://tags.tiqcdn.com/utag/nearu/<brand>/prod/utag.js

-- ############################################################################
-- 0003_multi_brand.sql
-- ############################################################################

-- ============================================================================
-- Fields that turned out to be brand-specific once brand #2 was onboarded
-- (they had been hardcoded in components for brand #1).
-- ============================================================================

-- Header strapline under the logo, e.g. "Greenville's Trusted HVAC & Plumbing
-- Services Since 1981" / "Serving the communities in the Columbia, SC area since 1985".
alter table sites add column if not exists header_tagline text;

-- Footer license line(s), e.g. ["License #M-116444"] or
-- ["Com/Indust/Equip Repair/Maint 2023-56064", "HVAC 2023-410", "Electrical 2023-16672"].
alter table sites add column if not exists license_lines jsonb not null default '[]';

-- Where this brand's content was mirrored from (provenance / re-sync target).
alter table sites add column if not exists source_origin text;

-- Intrinsic pixel size of logo_path, so next/image renders the right aspect
-- ratio (brand logos differ: 3468x2120 vs 3189x1279, etc).
alter table sites add column if not exists logo_width int;
alter table sites add column if not exists logo_height int;

-- `theme` jsonb already exists; it now carries build/markup hints the layout
-- reads at runtime:
--   { "bodyClass": "wp-child-theme-chs",          -- WP child-theme body class
--     "preloadFonts": ["Roboto-Regular.woff2", ...] }  -- above-the-fold fonts to <link rel=preload>

-- Theme icon-sprite id for each service category card (ServicesList),
-- e.g. 'heating', 'cooling', 'indoor-air-quality', 'plumbing', 'drains',
-- 'electrical', 'generator'. Previously a hardcoded slug->icon map.
alter table service_categories add column if not exists icon text;

-- ############################################################################
-- 0004_company.sql
-- ############################################################################

-- ============================================================================
-- The company level: NearU owns every brand site. Anything that is identical
-- across all 23 brands lives here ONCE instead of being repeated per site
-- (or, worse, hardcoded in components).
-- ============================================================================

create table if not exists companies (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,                 -- 'nearu'
  name                text not null,                        -- 'NearU Services'
  -- Careers pages are one shared ATS; each brand is a sub-path of it.
  careers_base_url    text,                                 -- 'https://jobs.dayforcehcm.com/en-US/nearu/'
  -- Cookie banner copy (theme's <cookie-consent> element), same on every brand.
  cookie_notice_html  text,
  -- Footer legal links, same on every brand: [{label, href}]
  legal_links         jsonb not null default '[]',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger companies_set_updated_at before update on companies
  for each row execute function set_updated_at();
alter table companies enable row level security;

insert into companies (slug, name, careers_base_url, cookie_notice_html, legal_links)
values (
  'nearu',
  'NearU Services',
  'https://jobs.dayforcehcm.com/en-US/nearu/',
  'We use cookies to operate our website, analyze web traffic, and serve advertisements. You can find more information about our use of cookies and, depending on where you access this website from, contact us to opt out of cookies being used for certain analytics and advertising purposes by viewing information in <a href="/privacy-policy">our Privacy Policy</a>.',
  '[
    {"label": "Privacy Policy",            "href": "/privacy-policy"},
    {"label": "California Privacy Notice", "href": "/privacy-policy#california-notice"},
    {"label": "Terms and Conditions",      "href": "/terms-and-conditions"},
    {"label": "Sitemap",                   "href": "/sitemap"}
  ]'::jsonb
)
on conflict (slug) do nothing;

-- Every site belongs to a company. Backfill existing sites to NearU.
alter table sites add column if not exists company_id uuid references companies(id) on delete restrict;
update sites set company_id = (select id from companies where slug = 'nearu') where company_id is null;
alter table sites alter column company_id set not null;
create index if not exists sites_company_idx on sites(company_id);

-- Lifecycle flag so a brand can be staged in the DB before it's public.
alter table sites add column if not exists status text not null default 'active'
  check (status in ('draft', 'active', 'archived'));

-- ----------------------------------------------------------------------------
-- Hot-path indexes for the queries every request makes (all site-scoped).
-- pages(site_id, path) and the other unique constraints already index the
-- primary lookups; these cover the remaining ordered/filtered reads.
-- ----------------------------------------------------------------------------
create index if not exists nav_items_site_menu_idx        on nav_items(site_id, menu, sort_order);
create index if not exists pages_site_type_idx            on pages(site_id, page_type);
create index if not exists service_categories_site_sort   on service_categories(site_id, sort_order);

-- ----------------------------------------------------------------------------
-- One-glance view of every brand: what's loaded for each site.
-- ----------------------------------------------------------------------------
create or replace view brand_overview as
select
  c.name                                                        as company,
  s.slug,
  s.name,
  s.domain,
  s.status,
  (select count(*) from pages p where p.site_id = s.id)         as pages,
  (select count(*) from nav_items n where n.site_id = s.id)     as nav_items,
  (select count(*) from service_categories x where x.site_id = s.id) as service_categories,
  (select count(*) from sub_services x where x.site_id = s.id)  as sub_services,
  (select count(*) from locations x where x.site_id = s.id)     as locations,
  (select count(*) from redirects x where x.site_id = s.id)     as redirects,
  (select count(*) from media_assets x where x.site_id = s.id)  as media_assets,
  s.updated_at
from sites s
join companies c on c.id = s.company_id
order by s.slug;
