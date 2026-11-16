// The one page shell: head, header, footer. Every page goes through page().
export interface Assets { css: string; preload: string[]; js: Record<string, string> }
export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const github = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
const mark = `<svg viewBox="0 0 4 4" fill="currentColor" aria-hidden="true"><path d="M0 0h4v4H3V1H2v3H0V3h1V1H0z"/></svg>`;
// Native prerender on hover for same-site pages: instant navigation, no JS shipped.
const rules = JSON.stringify({ prerender: [{ where: { href_matches: "/*" }, eagerness: "moderate" }] });

interface Page { title?: string; description?: string; body: string; scripts?: string[]; footer?: boolean; docs?: boolean }

export function page(assets: Assets, { title = "yumedots", description = "Monochrome Hyprland + quickshell dotfiles by yumedots.", body, scripts = [], footer = true, docs = false }: Page) {
  const tags = ["github", ...scripts].map(n => `<script type="module" src="${assets.js[n]}"></script>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/yumedots.svg" type="image/svg+xml">
${assets.preload.map(href => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`).join("")}
<style>${assets.css}</style>
<script type="speculationrules">${rules}</script>
</head>
<body>
<header>
  <div class="wrap">
    <a class="logo" href="/" aria-label="yumedots home">${mark}yumedots</a>
    <nav class="links">
      <a href="/#install">Install</a>
      <a href="/docs/"${docs ? ` aria-current="page"` : ""}>Documentation</a>
    </nav>
    <div class="right">
      <a class="stars" href="https://github.com/yumedots/dotfiles" aria-label="yumedots/dotfiles on GitHub"><svg viewBox="0 0 16 16" fill="currentColor"><path d="${github}"/></svg><span id="stars" hidden></span></a>
      <a class="btn sm" href="https://github.com/yumedots/dotfiles">Open the repo</a>
    </div>
  </div>
</header>
<main>${body}</main>
${footer ? `<footer>
  <div class="wrap">
    <p>Dotfiles by the <a class="org" href="https://github.com/yumedots">${mark}yumedots</a> organization, made by <a class="me" href="https://github.com/yyyumeniku"><img src="https://github.com/yyyumeniku.png?size=96" alt="" width="20" height="20">yyyumeniku</a>.</p>
    <ul class="cols">
      <li><a href="/#install">Install</a></li>
      <li><a href="/docs/">Documentation</a></li>
      <li><a href="https://github.com/yumedots/dotfiles/issues">Issues</a></li>
    </ul>
  </div>
</footer>` : ""}
${tags}
</body>
</html>
`;
}
