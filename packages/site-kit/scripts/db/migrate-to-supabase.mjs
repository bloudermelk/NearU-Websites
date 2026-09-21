#!/usr/bin/env node
/**
 * One-time (and re-runnable) migration: pushes one brand's local content
 * (content/site.json, optional home.json + home-inline.css,
 * html/*.json, images/**) into the shared Supabase project — scoped to that
 * brand's `sites` row.
 *
 * Idempotent: re-running upserts the `sites` row and replaces all of this
 * site's rows in the other tables (safe to run again after editing local
 * content, or to re-sync after `node scripts/extract-pages.mjs`).
 *
 * Requires (env or .env.local): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * and the brand from content/site.json "slug". SITE_DOMAIN is taken from
 * site.json `business.domain` (falls back to the SITE_DOMAIN env var).
 *
 * Usage:
 *   npm run db:migrate                # content + images
 *   npm run db:migrate:content-only  # content only (fast re-runs)
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { brandDir, loadEnvLocal, loadSiteJson, resolveSiteSlug } from "../lib/env.mjs";

loadEnvLocal();
const SITE_SLUG = resolveSiteSlug();
const BRAND_DIR = brandDir();
const IMAGES_DIR = join(BRAND_DIR, "images");
const BUCKET = "site-media";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SKIP_IMAGES = process.argv.includes("--skip-images");
/** Only refresh the `sites` row and the "/" page (content/home.json). Implies --skip-images. */
const ONLY_HOME = process.argv.includes("--only-home");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/**
 * Builds the local "/images/..." -> Supabase public URL map. `getPublicUrl`
 * is a pure string-template call (no network request, doesn't check
 * existence) so this is cheap and safe to call even when skipping the
 * actual upload — content-only re-runs still need correct URLs to rewrite
 * into page HTML/jsonb.
 */
/** content/images/2024/08/logo.png -> "/images/2024/08/logo.png" (the path used inside content). */
function relImagePath(full) {
  return "/images/" + relative(IMAGES_DIR, full).split("\\").join("/");
}

function buildImageMap(files) {
  const map = new Map();
  for (const full of files) {
    const relPath = relImagePath(full);
    const storagePath = `${SITE_SLUG}${relPath}`; // "<slug>/images/2024/08/logo.png"
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    map.set(relPath, pub.publicUrl);
  }
  return map;
}

/** Uploads every file under public/images/ to `<slug>/images/...` in the bucket. */
async function uploadImages(files, map) {
  console.log(`Uploading ${files.length} images to bucket "${BUCKET}"...`);

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Creating public bucket "${BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
  }

  let uploaded = 0;
  for (const full of files) {
    const relPath = relImagePath(full);
    const storagePath = `${SITE_SLUG}${relPath}`;
    if (!map.has(relPath)) continue;
    const contentType = CONTENT_TYPES[extname(full).toLowerCase()] ?? "application/octet-stream";
    const body = readFileSync(full);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, body, {
        contentType,
        upsert: true,
        // 1 year, immutable: paths are stable and content only changes via
        // this same upload step (upsert:true), so a long cache is safe and
        // meaningfully speeds up repeat image loads (see AGENTS.md).
        cacheControl: "31536000",
      });
    if (error) {
      console.log(`  FAIL ${storagePath}: ${error.message}`);
      continue;
    }
    uploaded++;
    if (uploaded % 20 === 0) console.log(`  ...${uploaded}/${files.length}`);
  }
  console.log(`Uploaded ${uploaded}/${files.length} images.`);
}

/** Replaces every occurrence of a known "/images/..." path in `text` with its public URL. */
function rewriteImagePaths(text, map) {
  if (typeof text !== "string" || !text.includes("/images/")) return text;
  return text.replace(/\/images\/[^"'\s)>]+/g, (match) => map.get(match) ?? match);
}

function rewriteDeep(value, map) {
  if (typeof value === "string") return rewriteImagePaths(value, map);
  if (Array.isArray(value)) return value.map((v) => rewriteDeep(v, map));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteDeep(v, map);
    return out;
  }
  return value;
}

function lookupImage(localPath, map) {
  if (!localPath) return null;
  return map.get(localPath) ?? localPath;
}

/** Records every local image as a row in media_assets (path + public URL), for asset tracking/audit. */
async function replaceMediaAssets(siteId, files) {
  await supabase.from("media_assets").delete().eq("site_id", siteId);
  const rows = files.map((full) => {
    return {
      site_id: siteId,
      storage_path: `${SITE_SLUG}${relImagePath(full)}`,
      original_url: null,
      alt: null,
    };
  });
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from("media_assets").insert(rows.slice(i, i + BATCH));
    if (error) throw new Error(`insert media_assets batch ${i}: ${error.message}`);
  }
  console.log(`Recorded ${rows.length} media_assets.`);
}

/** Upserts the `redirects` table from content/site.json's "redirects" array. */
async function replaceRedirects(siteId, siteJson) {
  await supabase.from("redirects").delete().eq("site_id", siteId);
  const rows = (siteJson.redirects ?? []).map((r) => ({
    site_id: siteId,
    source: r.source,
    destination: r.destination,
    permanent: r.permanent ?? true,
  }));
  if (rows.length) {
    const { error } = await supabase.from("redirects").insert(rows);
    if (error) throw new Error(`insert redirects: ${error.message}`);
  }
  console.log(`Inserted ${rows.length} redirects.`);
}

/**
 * Thin index for location + sub-service pages, derived from the mirrored
 * page paths already in content/html/*.json (the actual rendered content
 * stays in the generic `pages` table as mirrored HTML — see AGENTS.md for
 * why this is intentionally a thin index rather than full structured
 * extraction). Cross-linking/sitemap use only; not used to render the pages.
 */
async function replaceLocationsAndSubServices(siteId, siteJson, categoryRows, imageMap) {
  const dir = join(BRAND_DIR, "html");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const pages = files.map((f) => JSON.parse(readFileSync(join(dir, f), "utf-8")));

  // ---------- locations ----------
  // Each brand's location pages follow a slug convention like
  // "/<city>-hvac-plumbing-electrical-generators" (Carolina Heating) or
  // "/<city>-sc-hvac-plumbing-generator" (2nd Wind). site.json declares the
  // suffix so we can both match the pages and recover the city name.
  await supabase.from("locations").delete().eq("site_id", siteId);
  const suffix = siteJson.source?.locationSlugSuffix;
  const locationPages = suffix ? pages.filter((p) => /^\/[a-z0-9-]+$/.test(p.path) && p.path.endsWith(suffix)) : [];
  if (!suffix) console.log("  (no source.locationSlugSuffix in site.json — skipping locations index)");
  const locationRows = locationPages.map((p, i) => {
    const citySlugPart = p.path.replace(/^\//, "").slice(0, -suffix.length);
    const cityName = citySlugPart
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
    return {
      site_id: siteId,
      slug: p.path.replace(/^\//, ""),
      city_name: cityName,
      meta_title: p.title || null,
      meta_description: p.description || null,
      hero_image_path: lookupImage(p.ogImage, imageMap),
      sort_order: i,
    };
  });
  if (locationRows.length) {
    const { error } = await supabase.from("locations").insert(locationRows);
    if (error) throw new Error(`insert locations: ${error.message}`);
  }
  console.log(`Inserted ${locationRows.length} locations (thin index).`);

  // ---------- sub_services: /services/<category-slug>/<sub-service-slug> ----------
  await supabase.from("sub_services").delete().eq("site_id", siteId);
  const catIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));
  const subServicePages = pages.filter((p) => /^\/services\/[^/]+\/[^/]+$/.test(p.path));
  const subServiceRows = subServicePages
    .map((p, i) => {
      const [, , categorySlug, subSlug] = p.path.split("/");
      const categoryId = catIdBySlug.get(categorySlug);
      if (!categoryId) {
        console.log(`  SKIP sub_service ${p.path}: no matching service_category "${categorySlug}"`);
        return null;
      }
      return {
        site_id: siteId,
        service_category_id: categoryId,
        slug: subSlug,
        title: p.title || subSlug,
        description: p.description || null,
        image_path: lookupImage(p.ogImage, imageMap),
        href: p.path,
        sort_order: i,
      };
    })
    .filter(Boolean);
  if (subServiceRows.length) {
    const { error } = await supabase.from("sub_services").insert(subServiceRows);
    if (error) throw new Error(`insert sub_services: ${error.message}`);
  }
  console.log(`Inserted ${subServiceRows.length} sub_services (thin index).`);
}

/** Resolves the owning company (default NearU) — every site must belong to one. */
async function resolveCompanyId(siteJson) {
  const companySlug = siteJson.company || "nearu";
  const { data, error } = await supabase.from("companies").select("id").eq("slug", companySlug).maybeSingle();
  if (error) throw new Error(`lookup company "${companySlug}": ${error.message}`);
  if (!data) {
    throw new Error(
      `Company "${companySlug}" not found. Run supabase/migrations/0004_company.sql (it seeds the NearU row).`
    );
  }
  return data.id;
}

async function upsertSite(siteJson, imageMap) {
  const b = siteJson.business;
  const row = {
    slug: SITE_SLUG,
    company_id: await resolveCompanyId(siteJson),
    domain: b.domain || process.env.SITE_DOMAIN || null,
    name: b.name,
    legal_name: b.legalName,
    tagline: b.tagline,
    header_tagline: b.headerTagline ?? null,
    license_lines: b.licenseLines ?? [],
    theme: siteJson.theme ?? {},
    source_origin: siteJson.source?.origin ?? null,
    phone: b.phone,
    phone_href: b.phoneHref,
    email: b.email,
    address: b.address,
    area_served: b.areaServed,
    location_label: b.locationLabel,
    map_url: b.mapUrl,
    logo_path: lookupImage(b.logo, imageMap),
    logo_width: b.logoWidth ?? null,
    logo_height: b.logoHeight ?? null,
    founded_year: b.foundedYear,
    years_in_business: b.yearsInBusiness,
    google_rating: b.googleRating,
    google_review_count: b.googleReviewCount,
    social: b.social,
    schedule_url: b.scheduleUrl,
    youtube_video_id: b.youtubeVideoId,
    // Banner is stored as inner HTML (from `npm run content:nav`'s topBanner.html);
    // older site.json files with {text, href} are converted to the same shape.
    top_banner_text:
      siteJson.topBanner?.html ??
      (siteJson.topBanner?.text
        ? siteJson.topBanner.href
          ? `<a href="${siteJson.topBanner.href}">${siteJson.topBanner.text}</a>`
          : siteJson.topBanner.text
        : null) ??
      null,
    top_banner_href: null,
    // Third-party integration IDs (nullable by design — see AGENTS.md).
    // Not set in content/site.json for this prototype; add them there
    // (schedulerId/schedulerApiKey/gtmId/tealiumSrc under "business") when
    // actually going live for a brand.
    scheduler_id: b.schedulerId ?? null,
    scheduler_api_key: b.schedulerApiKey ?? null,
    gtm_id: b.gtmId ?? null,
    tealium_src: b.tealiumSrc ?? null,
  };
  const { data, error } = await supabase.from("sites").upsert(row, { onConflict: "slug" }).select().single();
  if (error) throw new Error(`upsert sites: ${error.message}`);
  console.log(`Site "${data.slug}" -> ${data.id}`);
  return data.id;
}

async function replaceNavItems(siteId, siteJson) {
  await supabase.from("nav_items").delete().eq("site_id", siteId);

  const rows = [];
  let order = 0;

  function addPrimary(items) {
    for (const item of items) {
      const topId = crypto.randomUUID();
      rows.push({
        id: topId,
        site_id: siteId,
        parent_id: null,
        menu: "primary",
        kind: "top",
        label: item.label,
        href: item.href ?? null,
        sort_order: order++,
      });
      if (item.groups) {
        let gOrder = 0;
        for (const group of item.groups) {
          const groupId = crypto.randomUUID();
          rows.push({
            id: groupId,
            site_id: siteId,
            parent_id: topId,
            menu: "primary",
            kind: "group",
            label: group.label ?? null,
            href: null,
            sort_order: gOrder++,
          });
          let lOrder = 0;
          for (const link of group.items) {
            rows.push({
              id: crypto.randomUUID(),
              site_id: siteId,
              parent_id: groupId,
              menu: "primary",
              kind: "link",
              label: link.label,
              href: link.href,
              sort_order: lOrder++,
            });
          }
        }
      }
    }
  }

  function addFooter(columns) {
    let colOrder = 0;
    for (const col of columns) {
      const colId = crypto.randomUUID();
      rows.push({
        id: colId,
        site_id: siteId,
        parent_id: null,
        menu: "footer",
        kind: "group",
        label: null,
        href: null,
        sort_order: colOrder++,
      });
      let lOrder = 0;
      for (const link of col) {
        rows.push({
          id: crypto.randomUUID(),
          site_id: siteId,
          parent_id: colId,
          menu: "footer",
          kind: "link",
          label: link.label,
          href: link.href,
          sort_order: lOrder++,
        });
      }
    }
  }

  addPrimary(siteJson.nav.primary);
  addFooter(siteJson.footer.columns);

  const { error } = await supabase.from("nav_items").insert(rows);
  if (error) throw new Error(`insert nav_items: ${error.message}`);
  console.log(`Inserted ${rows.length} nav_items.`);
}

async function replaceServiceCategories(siteId, siteJson, imageMap) {
  await supabase.from("service_categories").delete().eq("site_id", siteId);
  const rows = siteJson.serviceCategories.map((c, i) => ({
    site_id: siteId,
    slug: c.slug,
    title: c.title,
    short_title: c.shortTitle,
    summary: c.summary,
    image_path: lookupImage(c.image, imageMap),
    icon: c.icon ?? null, // theme icon-sprite id (e.g. "heating"), used by ServicesList
    sort_order: i,
  }));
  let inserted = [];
  if (rows.length) {
    const { data, error } = await supabase.from("service_categories").insert(rows).select("id, slug");
    if (error) throw new Error(`insert service_categories: ${error.message}`);
    inserted = data;
  }
  console.log(`Inserted ${rows.length} service_categories.`);
  return inserted;
}

async function replaceCertifications(siteId, siteJson, imageMap) {
  await supabase.from("certifications").delete().eq("site_id", siteId);
  const rows = siteJson.certifications.map((c, i) => ({
    site_id: siteId,
    name: c.name,
    image_path: lookupImage(c.image, imageMap),
    width: c.width,
    height: c.height,
    sort_order: i,
  }));
  if (rows.length) {
    const { error } = await supabase.from("certifications").insert(rows);
    if (error) throw new Error(`insert certifications: ${error.message}`);
  }
  console.log(`Inserted ${rows.length} certifications.`);
}

async function replaceTestimonials(siteId, siteJson) {
  await supabase.from("testimonials").delete().eq("site_id", siteId);
  const rows = siteJson.testimonials.map((t, i) => ({
    site_id: siteId,
    author: t.author,
    rating: t.rating,
    body: t.body,
    sort_order: i,
  }));
  if (rows.length) {
    const { error } = await supabase.from("testimonials").insert(rows);
    if (error) throw new Error(`insert testimonials: ${error.message}`);
  }
  console.log(`Inserted ${rows.length} testimonials.`);
}

/**
 * Two kinds of homepage:
 *  - hand-built (page_type='home'): content/home.json + home-inline.css
 *    (optional) drive the conversion-first landing homepage
 *    (src/components/landing/LandingHome.tsx; data shape: LandingPageData).
 *  - mirrored (page_type='mirrored'): the live homepage was extracted like any
 *    other page into content/html/index.json, and page.tsx renders its
 *    HTML. This is the default for new brands — no per-brand React needed.
 * If home.json exists it wins; otherwise upsertMirroredPages handles "/".
 */
async function upsertHomePage(siteId, siteJson, imageMap) {
  const homeFile = join(BRAND_DIR, "home.json");
  if (!existsSync(homeFile)) {
    console.log("No home.json — homepage will be the mirrored html/index.json (page_type=mirrored).");
    return false;
  }
  const homeJson = JSON.parse(readFileSync(homeFile, "utf-8"));
  // Optional: the landing homepage ships its own scoped CSS from the component,
  // so most brands have no home-inline.css.
  const inlineCssFile = join(BRAND_DIR, "home-inline.css");
  const inlineCss = existsSync(inlineCssFile) ? readFileSync(inlineCssFile, "utf-8") : null;
  const data = rewriteDeep(homeJson, imageMap);
  const { metaTitle, metaDescription, ...rest } = data;

  const row = {
    site_id: siteId,
    path: "/",
    page_type: "home",
    title: metaTitle,
    description: metaDescription,
    og_image_path: null,
    inline_css: inlineCss,
    html: null,
    data: rest,
    source_url: (siteJson.source?.origin ?? "") + "/",
    extracted_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("pages").upsert(row, { onConflict: "site_id,path" });
  if (error) throw new Error(`upsert home page: ${error.message}`);
  console.log("Upserted hand-built home page (page_type=home).");
  return true;
}

async function upsertMirroredPages(siteId, imageMap, { skipHome }) {
  const dir = join(BRAND_DIR, "html");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const pages = files
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf-8")))
    .filter((json) => !(skipHome && json.path === "/"));
  console.log(`Upserting ${pages.length} mirrored pages...`);

  const rows = pages.map((json) => {
    const isBlogPost =
      json.path.startsWith("/about-us/blog/") && json.path !== "/about-us/blog";
    return {
      site_id: siteId,
      path: json.path,
      page_type: isBlogPost ? "blog_post" : "mirrored",
      title: json.title || null,
      description: json.description || null,
      og_image_path: lookupImage(json.ogImage, imageMap),
      inline_css: json.inlineCss || null,
      html: rewriteImagePaths(json.html, imageMap),
      data: null,
      source_url: json.sourceUrl || null,
      extracted_at: json.extractedAt || null,
    };
  });

  // Upsert in batches to stay well under request size limits.
  const BATCH = 20;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("pages").upsert(batch, { onConflict: "site_id,path" });
    if (error) throw new Error(`upsert pages batch ${i}: ${error.message}`);
    console.log(`  ...${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log(`Upserted ${rows.length} mirrored pages.`);
}

async function main() {
  console.log(`Migrating "${SITE_SLUG}" (content/) into Supabase (${SUPABASE_URL})...\n`);

  const files = existsSync(IMAGES_DIR) ? walk(IMAGES_DIR) : [];
  const imageMap = buildImageMap(files);
  if (SKIP_IMAGES || ONLY_HOME) {
    console.log(`Reusing computed Storage URLs for ${files.length} images without re-uploading.\n`);
  } else {
    await uploadImages(files, imageMap);
  }

  const siteJson = loadSiteJson();
  const siteId = await upsertSite(siteJson, imageMap);

  if (ONLY_HOME) {
    // Fast path for homepage copy edits: refresh the sites row + the "/" page only.
    const ok = await upsertHomePage(siteId, siteJson, imageMap);
    if (!ok) throw new Error("--only-home requires content/home.json");
    console.log("\nDone (sites + homepage only).");
    return;
  }

  await replaceNavItems(siteId, siteJson);
  const categoryRows = await replaceServiceCategories(siteId, siteJson, imageMap);
  await replaceCertifications(siteId, siteJson, imageMap);
  await replaceTestimonials(siteId, siteJson);
  await replaceRedirects(siteId, siteJson);
  await replaceMediaAssets(siteId, files);
  const hasHandBuiltHome = await upsertHomePage(siteId, siteJson, imageMap);
  await upsertMirroredPages(siteId, imageMap, { skipHome: hasHandBuiltHome });
  await replaceLocationsAndSubServices(siteId, siteJson, categoryRows, imageMap);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
