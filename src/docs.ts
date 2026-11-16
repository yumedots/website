import { readdir } from "node:fs/promises";
import { esc, page, type Assets } from "./layout.ts";

const arrow = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="${d}"/></svg>`;

// Every Markdown file in src/content/docs is one page, in file name order. The first "## Title" names it
// in the side list. The first file is /docs/ itself; "2-launcher.md" is /docs/launcher/.
export async function docs(assets: Assets) {
  const dir = "src/content/docs";
  const names = (await readdir(dir)).filter(n => n.endsWith(".md")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const pages = await Promise.all(names.map(async (name, i) => {
    const md = await Bun.file(`${dir}/${name}`).text();
    return {
      path: i === 0 ? "docs/" : `docs/${name.replace(/^\d+-|\.md$/g, "")}/`,
      title: md.match(/^## (.+)$/m)?.[1] ?? name,
      html: Bun.markdown.html(md),
    };
  }));
  return pages.map((p, i) => {
    const [prev, next] = [pages[i - 1], pages[i + 1]];
    return [`${p.path}index.html`, page(assets, {
      title: `${p.title} · yumedots`,
      description: `${p.title}: yumedots Hyprland dotfiles documentation.`,
      footer: false,
      docs: true,
      body: `
  <div class="docs">
    <nav class="toc" aria-label="Documentation">
      ${pages.map(q => `<a href="/${q.path}"${q === p ? ` aria-current="page"` : ""}>${esc(q.title)}</a>`).join("\n      ")}
    </nav>
    <div class="page">
      <h1>${esc(p.title)}</h1>
      <article class="prose">${p.html}</article>
      <nav class="pager" aria-label="Pages">
        ${prev ? `<a href="/${prev.path}" aria-label="Previous: ${esc(prev.title)}">${arrow("M19 12H5M11 6l-6 6 6 6")}${esc(prev.title)}</a>` : ""}
        ${next ? `<a class="next" href="/${next.path}" aria-label="Next: ${esc(next.title)}">${esc(next.title)}${arrow("M5 12h14M13 6l6 6-6 6")}</a>` : ""}
      </nav>
    </div>
  </div>
`})] as const;
  });
}
