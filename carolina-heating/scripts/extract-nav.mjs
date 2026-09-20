/**
 * Extracts the primary (header mega-menu) and footer navigation from a brand's
 * live homepage into the `nav.primary` / `footer.columns` shape used by
 * content/<slug>/site.json, and prints it as JSON to merge in.
 *
 * Usage: node scripts/extract-nav.mjs --site <slug>   (reads source.origin from site.json)
 *
 * NearU theme menu markup, 3 levels deep:
 *   <ul id="primary-menu">
 *     <li> <a>Top link</a> </li>                                  -> { label, href }
 *     <li> <span is-shell>Top</span> <ul class="sub-menu">          -> { label, groups: [...] }
 *       <li> <span is-title>Group</span> <ul class="sub-sub-menu">   ->   { label, items: [...] }
 *         <li><a>Link</a></li>                                        ->     { label, href }
 *       <li> <a>Ungrouped link</a> </li>                             ->   (collected into an unlabeled group)
 */
import { loadSiteJson, resolveSiteSlug } from "./lib/env.mjs";

const SLUG = resolveSiteSlug();
const SITE = loadSiteJson(SLUG);
const ORIGIN = SITE.source?.origin?.replace(/\/$/, "");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const res = await fetch(`${ORIGIN}/?nowprocket=1`, { headers: { "User-Agent": UA } });
const html = await res.text();

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#8217;/g, "\u2019").replace(/&rsquo;/g, "\u2019").replace(/&nbsp;/g, " ").trim();
const toLocal = (href) => {
  if (!href) return href;
  if (href.startsWith(ORIGIN)) {
    const p = href.slice(ORIGIN.length).replace(/\/$/, "");
    return p === "" ? "/" : p;
  }
  return href;
};

/** Minimal tree builder over <ul>/<li>/<a>/<span> tags inside a menu. */
function parseMenu(fragment) {
  const tokens = [...fragment.matchAll(/<(\/?)(ul|li|a|span|button)\b([^>]*)>|([^<]+)/g)];
  const root = { children: [] };
  const stack = [root];
  let textTarget = null;
  for (const t of tokens) {
    if (t[4] !== undefined) {
      if (textTarget) textTarget.text += t[4];
      continue;
    }
    const closing = t[1] === "/", tag = t[2], attrs = t[3] || "";
    const top = stack[stack.length - 1];
    if (tag === "ul") {
      if (!closing) { const ul = { type: "ul", children: [] }; top.children.push(ul); stack.push(ul); }
      else if (top.type === "ul") stack.pop();
    } else if (tag === "li") {
      if (!closing) { const li = { type: "li", children: [] }; top.children.push(li); stack.push(li); }
      else if (top.type === "li") stack.pop();
    } else if (tag === "a" || tag === "span") {
      if (!closing) {
        const isLabel = tag === "a" || /menu-interactive--is-(shell|title)/.test(attrs);
        if (isLabel) {
          const href = (attrs.match(/href="([^"]*)"/) || [])[1];
          const node = { type: tag, href, text: "" };
          top.children.push(node);
          textTarget = node;
        }
      } else textTarget = null;
    }
  }
  return root;
}

function liLabel(li) {
  const lab = li.children.find((c) => c.type === "a" || c.type === "span");
  return lab ? { label: decode(lab.text), href: lab.href ? toLocal(lab.href) : undefined } : null;
}
const subList = (li) => li.children.find((c) => c.type === "ul");

function buildPrimary(ul) {
  return ul.children.filter((c) => c.type === "li").map((li) => {
    const { label, href } = liLabel(li);
    const sub = subList(li);
    if (!sub) return { label, href };
    const groups = [];
    let loose = null;
    for (const gli of sub.children.filter((c) => c.type === "li")) {
      const gl = liLabel(gli);
      const gsub = subList(gli);
      if (gsub) {
        groups.push({ label: gl.label, items: gsub.children.filter((c) => c.type === "li").map((x) => liLabel(x)) });
      } else {
        if (!loose) { loose = { items: [] }; groups.push(loose); }
        loose.items.push(gl);
      }
    }
    return { label, ...(href ? { href } : {}), groups };
  });
}

// ---- primary ----
const pm = html.indexOf('id="primary-menu"');
const pmStart = html.lastIndexOf("<ul", pm);
const navEnd = html.indexOf("</nav>", pm);
const primaryTree = parseMenu(html.slice(pmStart, navEnd));
const primary = buildPrimary(primaryTree.children[0]);

// ---- footer ----
const fStart = html.indexOf('<footer id="colophon"');
const fEnd = html.indexOf("</footer>", fStart);
const footer = html.slice(fStart, fEnd);
const columns = [...footer.matchAll(/<ul[^>]*id="secondary-menu-\d+"[^>]*>([\s\S]*?)<\/ul>/g)].map((m) =>
  [...m[1].matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((a) => ({ label: decode(a[2].replace(/<[^>]+>/g, "")), href: toLocal(a[1]) }))
);

const out = { nav: { primary }, footer: { columns } };
const outArg = process.argv.indexOf("--out");
if (outArg >= 0 && process.argv[outArg + 1]) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(process.argv[outArg + 1], JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${process.argv[outArg + 1]}: ${primary.length} top-level items, ${columns.length} footer columns.`);
} else {
  console.log(JSON.stringify(out, null, 2));
}
