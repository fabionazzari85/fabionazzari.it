import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteUrl } from "./seo-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const corePages = [
  { path: "/", file: "index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/fabio-nazzari", file: "fabio-nazzari/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/consulenza", file: "consulenza/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/negozio", file: "negozio/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/case-study", file: "case-study/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/case-study/origini", file: "case-study/origini/index.html", hreflang: ["it", "x-default"], jsonLd: true },
  { path: "/case-study/gli-imperfetti", file: "case-study/gli-imperfetti/index.html", hreflang: ["it", "x-default"], jsonLd: true },
  { path: "/en/", file: "en/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/en/fabio-nazzari", file: "en/fabio-nazzari/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/en/consulting", file: "en/consulting/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/en/case-studies", file: "en/case-studies/index.html", hreflang: ["it", "en", "x-default"], jsonLd: true },
  { path: "/ricette", file: "ricette/index.html", hreflang: [], jsonLd: true }
];

const redirects = new Map([
  ["/pasticceria", "/negozio"],
  ["/pasticceria/", "/negozio"],
  ["/negozio.html", "/negozio"]
]);

const fail = (message) => {
  throw new Error(message);
};

const read = (file) => readFile(path.join(rootDir, file), "utf8");

const attr = (html, pattern) => pattern.exec(html)?.[1] || "";

const stripScripts = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

const jsonLdBlocks = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);

for (const page of corePages) {
  const html = await read(page.file);
  const visibleHtml = stripScripts(html);
  const title = attr(html, /<title>([\s\S]*?)<\/title>/i).trim();
  const description = attr(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i).trim();
  const canonical = attr(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i).trim();
  const ogUrl = attr(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i).trim();
  const h1Count = (visibleHtml.match(/<h1\b/gi) || []).length;
  const expectedCanonical = `${siteUrl}${page.path === "/" ? "/" : page.path}`;

  if (!title) fail(`${page.path}: missing title`);
  if (!description) fail(`${page.path}: missing description`);
  if (!canonical.startsWith("https://www.fabionazzari.it/")) fail(`${page.path}: canonical is not absolute`);
  if (canonical !== expectedCanonical) fail(`${page.path}: canonical ${canonical} does not match ${expectedCanonical}`);
  if (redirects.has(new URL(canonical).pathname)) fail(`${page.path}: canonical points to redirect`);
  if (!ogUrl.startsWith("https://www.fabionazzari.it/")) fail(`${page.path}: og:url is not absolute`);
  if (ogUrl !== canonical) fail(`${page.path}: og:url does not match canonical`);
  if (h1Count !== 1) fail(`${page.path}: expected one H1, found ${h1Count}`);

  for (const hreflang of page.hreflang) {
    const re = new RegExp(`<link\\s+rel=["']alternate["']\\s+hreflang=["']${hreflang}["']\\s+href=["']https://www\\.fabionazzari\\.it/`, "i");
    if (!re.test(html)) fail(`${page.path}: missing absolute hreflang ${hreflang}`);
  }

  if (page.jsonLd) {
    const blocks = jsonLdBlocks(html);
    if (!blocks.length) fail(`${page.path}: missing JSON-LD`);
    for (const block of blocks) {
      JSON.parse(block);
    }
  }
}

const sitemap = await read("sitemap.xml");
for (const page of corePages) {
  const url = `${siteUrl}${page.path === "/" ? "/" : page.path}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    fail(`sitemap: missing ${url}`);
  }
}
for (const redirectPath of redirects.keys()) {
  if (sitemap.includes(`<loc>${siteUrl}${redirectPath}</loc>`)) {
    fail(`sitemap: contains redirect ${redirectPath}`);
  }
}

console.log(`SEO validation passed for ${corePages.length} core pages.`);
