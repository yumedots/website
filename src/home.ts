import { esc, page, type Assets } from "./layout.ts";

const clone = "git clone --recursive https://github.com/yumedots/dotfiles ~/dotfiles";
const copy = "cp -r ~/dotfiles/* ~/.config/";
const icon = (d: string, cls = "") => `<svg${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="${d}"/></svg>`;

export const home = (assets: Assets) => page(assets, { scripts: ["home", "contributors"], body: `
  <section class="hero">
    <canvas id="dots" aria-hidden="true"></canvas>
    <div class="wrap lead">
      <h1>yumedots</h1>
      <p>Hyprland dotfiles by <a href="https://github.com/yumedots">yumedots</a>. Black, flat and fast, ready the moment you log in.</p>
      <div class="cta">
        <a class="btn" href="#install">${icon("M12 4v11M7 10l5 5 5-5M5 20h14")}Get the dotfiles</a>
        <a class="btn ghost" href="/docs/">Documentation</a>
      </div>
    </div>
  </section>

  <section class="install" id="install">
    <div class="wrap">
      <div class="head">
        <h2>Install</h2>
        <p>Back up your <code>~/.config</code>, clone, copy, then log into Hyprland. Everything autostarts.</p>
      </div>
      <div class="code">
<pre><span>$ </span>${clone}
<span>$ </span>${copy}</pre>
        <button class="copy-btn" type="button" aria-label="Copy commands" data-copy="${esc(`${clone}\n${copy}`)}">${icon("M8 8h12v12H8zM4 16V4h12")}${icon("M4 12l5 5L20 6", ` class="check"`)}</button>
      </div>
    </div>
  </section>

  <section class="people" id="contributors" hidden>
    <div class="wrap">
      <div class="head">
        <h2>Contributors</h2>
        <p>The people who made this project come true.</p>
      </div>
      <ul id="people"></ul>
    </div>
  </section>
`});
