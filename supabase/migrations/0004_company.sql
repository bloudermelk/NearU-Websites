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
