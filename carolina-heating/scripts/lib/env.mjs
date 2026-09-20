import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Loads .env.local into process.env (without overriding vars already set),
 * so scripts behave the same whether run via `node --env-file`, from an npm
 * lifecycle hook (where --env-file isn't available), or on Vercel (where
 * the vars come from the project settings and there's no .env.local).
 */
export function loadEnvLocal() {
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf-8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

/** Path to a brand's content staging directory: content/<slug>/ */
export function brandDir(slug) {
  return join(ROOT, "content", slug);
}

/** Reads content/<slug>/site.json. */
export function loadSiteJson(slug) {
  const file = join(brandDir(slug), "site.json");
  if (!existsSync(file)) throw new Error(`No site.json for brand "${slug}" at ${file}`);
  return JSON.parse(readFileSync(file, "utf-8"));
}

/**
 * Resolves which brand a script should operate on: `--site <slug>` argv flag,
 * else SITE_SLUG from env/.env.local. Exits with a clear message otherwise.
 */
export function resolveSiteSlug(argv = process.argv.slice(2)) {
  const i = argv.indexOf("--site");
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  loadEnvLocal();
  if (process.env.SITE_SLUG) return process.env.SITE_SLUG;
  console.error("Which brand? Pass --site <slug> or set SITE_SLUG.");
  process.exit(1);
}

export { ROOT };
