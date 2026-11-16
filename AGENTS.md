# yumedots website

The site for the yumedots Hyprland dotfiles, hosted on Cloudflare Pages at https://yumedots.pages.dev.

## Commands

Bun is the only tool: package manager, bundler, Markdown renderer and dev server. Run every command with `bun`, never `npm`.

```sh
bun install       # install dependencies
bun run dev       # serve at localhost:4321, rebuilding when src/ changes
bun run build     # static build into dist/
bun run preview   # serve dist/ to check the production build
```

`build.ts` is the whole build. `wrangler.jsonc` is only Cloudflare Pages configuration: the project (`yumedots`) and its output folder (`dist/`). There is no server code and no Cloudflare tooling here. The repository is connected to that project, so every push to `main` builds with `bun run build` and deploys; that is the only way to deploy.

## Layout

| Path | What it holds |
| --- | --- |
| `build.ts` | The build: fonts, scripts, pages, static files into `dist/`. |
| `serve.ts` | Dev and preview server. |
| `src/layout.ts` | The one page shell: head, header, footer. Every page uses it. |
| `src/home.ts` | Homepage: the hero, the install commands and the contributors. |
| `src/docs.ts` | One documentation page per Markdown file. |
| `src/content/docs/*.md` | Documentation content. |
| `src/styles/site.css` | The only stylesheet. Colours and sizes are variables in `:root`. |
| `src/scripts/` | Small plain TypeScript scripts, one per job, bundled by `build.ts`. `gh.ts` is the shared cached GitHub API fetch. |

## Documentation

- Each Markdown file in `src/content/docs/` is one page. Its first `## Title` names it in the side list.
- The number at the start of the file name sets the order and is dropped from the URL: `2-launcher.md` is `/docs/launcher/`. The first file is `/docs/` itself.
- To add a page, add a file. No code changes.
- Plain Markdown only: tables, code spans for keys and paths. No colour, no HTML.

## Rules

1. **Static first.** Every page is plain HTML built ahead of time. Live data (GitHub stars, the contributors) is a small `fetch` after load from the official GitHub API through `src/scripts/gh.ts` (cached, stale on failure), and the page must read fine when it fails.
2. **No UI framework and no CSS library.** No React, Vue, Tailwind or component kits. Pages are plain template functions, one stylesheet.
3. **No new dependencies** unless one replaces code we would otherwise write and maintain. Today: none.
4. **Platform before script.** Use what the browser already does (speculation rules for instant navigation, `<details>`, CSS) before writing JavaScript.
5. **Size budget.** About 50 KB of HTML per page, CSS inlined, fonts self-hosted (`build.ts` downloads the latin subset), no images above the fold unless they are SVG.
6. **Sharp at every density.** Icons and logos are inline SVG. Raster images from the GitHub API are requested at at least 4× their displayed size.
7. **Quiet motion.** No page animations. Hover and focus states are colour changes only.

## Design

Black, flat and square, like the dotfiles themselves.

- Ground `#000` / `#0a0a0a`, white text, greys for secondary text. No accent colours.
- No rounded corners, gradients, shadows, blur or glass.
- Geist for text; Google Sans Code only for code, keys, paths and the wordmark in the header.
- Surfaces are separated by a step in grey, not by borders.
- Every page has one `h1`; every section has a heading.
