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
