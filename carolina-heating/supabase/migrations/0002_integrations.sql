-- ============================================================================
-- Third-party integration config, per site. All nullable — a brand with no
-- values set here simply renders nothing for that integration (safe default
-- for prototypes/staging; fill in when actually going live for a brand).
-- ============================================================================

alter table sites add column if not exists scheduler_id text;       -- ServiceTitan `data-schedulerid`
alter table sites add column if not exists scheduler_api_key text;  -- ServiceTitan `data-api-key`
alter table sites add column if not exists gtm_id text;             -- Google Tag Manager container, e.g. 'GTM-XXXXXXX'
alter table sites add column if not exists tealium_src text;        -- Full utag.js URL, e.g. https://tags.tiqcdn.com/utag/nearu/<brand>/prod/utag.js
