// The whole build: Markdown and templates to static HTML, scripts bundled, fonts self-hosted. Output in dist/.
import { cp, mkdir, rm } from "node:fs/promises";
import { basename } from "node:path";
import { docs } from "./src/docs.ts";
import { home } from "./src/home.ts";
import type { Assets } from "./src/layout.ts";

const FONTS = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Google+Sans+Code:wght@400;500&display=swap";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// Download once, keep in .cache so rebuilds work offline.
async function cached(url: string, headers?: HeadersInit) {
  const path = `.cache/${Bun.hash(url).toString(36)}-${basename(url).replace(/\W/g, "").slice(-24)}`;
  if (!(await Bun.file(path).exists())) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    await Bun.write(path, res);
  }
  return Bun.file(path);
}

// Latin subsets only, served from this site; the first weight of each family is preloaded.
async function fonts() {
  const css = await (await cached(FONTS, { "User-Agent": UA })).text();
  const blocks = css.split("/* ").filter(b => b.startsWith("latin */")).map(b => b.slice(b.indexOf("@font-face")).trim());
  const seen = new Set<string>();
  const preload: string[] = [];
  let out = "";
  for (const block of blocks) {
    const url = block.match(/url\((https:[^)]+\.woff2)\)/)![1];
    const name = basename(url);
    await Bun.write(`dist/fonts/${name}`, await cached(url));
    const family = block.match(/font-family: '([^']+)'/)![1];
    if (!seen.has(family)) { seen.add(family); preload.push(`/fonts/${name}`); }
    out += block.replace(url, `/fonts/${name}`);
  }
  return { css: out, preload };
}

async function scripts() {
  const built = await Bun.build({
    entrypoints: ["github", "home", "contributors"].map(n => `src/scripts/${n}.ts`),
    outdir: "dist/js", splitting: true, minify: true, naming: "[name]-[hash].[ext]",
  });
  if (!built.success) throw new AggregateError(built.logs, "script build failed");
  return Object.fromEntries(built.outputs.filter(o => o.kind === "entry-point").map(o => [basename(o.path).split("-")[0], `/js/${basename(o.path)}`]));
}

export async function build() {
  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });
  const [{ css, preload }, js] = await Promise.all([fonts(), scripts()]);
  const assets: Assets = { css: css.replace(/\s*\n\s*/g, "") + (await Bun.file("src/styles/site.css").text()), preload, js };
  for (const [path, html] of [["index.html", home(assets)] as const, ...(await docs(assets))]) await Bun.write(`dist/${path}`, html);
  await cp("public", "dist", { recursive: true });
}

if (import.meta.main) {
  const t = performance.now();
  await build();
  console.log(`built dist/ in ${Math.round(performance.now() - t)}ms`);
}
