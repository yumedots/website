import { WORD, W, H } from "../lib/wordmark.js";

const header = document.getElementById("top");
new IntersectionObserver(([e]) => header.classList.toggle("past", !e.isIntersecting), { rootMargin: "-57px 0px 0px 0px" }).observe(document.getElementById("home"));

document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => navigator.clipboard?.writeText(b.dataset.copy)));

const BAYER = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
const INK = ["#0d0d0d", "#1c1c1c", "#2f2f2f", "#5c5c5c"];
const BANDS = ["#ffffff", "#ffffff", "#e6e6e6", "#cfcfcf", "#b0b0b0", "#9a9a9a", "#7a7a7a"];
const canvas = document.getElementById("field"), ctx = canvas.getContext("2d"), slot = document.getElementById("slot");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cell, cols, rows, ox, oy, wx, wy, mouse = { x: -1e4, y: -1e4 }, glow = 0, last = 0;

function layout() {
  const dpr = devicePixelRatio || 1, r = canvas.getBoundingClientRect(), s = slot.getBoundingClientRect();
  canvas.width = r.width * dpr; canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cell = s.width / W;
  wx = s.left - r.left; wy = s.top - r.top;
  ox = wx - Math.ceil(wx / cell) * cell; oy = wy - Math.ceil(wy / cell) * cell;
  cols = Math.ceil((r.width - ox) / cell); rows = Math.ceil((r.height - oy) / cell);
}

function noise(x, y, t) {
  return (Math.sin(x * .21 + t * .6) + Math.sin(y * .27 - t * .45) + Math.sin((x + y) * .13 + t * .3) + Math.sin(Math.hypot(x - cols / 2, y - rows / 2) * .18 - t * .8)) / 4;
}

function draw(now) {
  const t = now / 1000, gap = Math.max(1, cell * .12), size = cell - gap;
  glow += ((mouse.x > -1e3 ? 1 : 0) - glow) * .08;
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const wc = Math.round((wx - ox) / cell), wr = Math.round((wy - oy) / cell);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const px = ox + x * cell, py = oy + y * cell, lx = x - wc, ly = y - wr;
    if (lx >= 0 && lx < W && ly >= 0 && ly < H && WORD[ly][lx] === "1") {
      ctx.fillStyle = BANDS[ly]; ctx.fillRect(px, py, size, size); continue;
    }
    const d = Math.hypot(px + cell / 2 - mouse.x, py + cell / 2 - mouse.y) / cell;
    const v = (noise(x, y, t) * .5 + .5) * .55 + Math.max(0, 1 - d / 11) * .9 * glow;
    const lvl = Math.min(3, Math.floor(v * 4 + BAYER[(y & 7) * 8 + (x & 7)] / 64 - .5));
    if (lvl < 0) continue;
    ctx.fillStyle = INK[lvl]; ctx.fillRect(px, py, size, size);
  }
}

function loop(now) {
  if (now - last > 33) { last = now; draw(now); }
  requestAnimationFrame(loop);
}

addEventListener("resize", () => { layout(); draw(performance.now()); });
canvas.parentElement.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; if (still) draw(0); });
canvas.parentElement.addEventListener("pointerleave", () => { mouse = { x: -1e4, y: -1e4 }; if (still) draw(0); });
document.fonts.ready.then(() => { layout(); still ? draw(0) : requestAnimationFrame(loop); });
layout(); draw(0);
