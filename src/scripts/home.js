document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
  b.classList.add("done"); setTimeout(() => b.classList.remove("done"), 1400);
}));

// A field of white dots on black. They are absent behind the copy, grow toward the edges,
// and a slow ripple runs outward from the centre. Still for reduced motion; paused off screen.
const canvas = document.getElementById("dots"), ctx = canvas.getContext("2d");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let w, h, step, running = false, frame = 0;

function size() {
  const dpr = devicePixelRatio || 1;
  ({ width: w, height: h } = canvas.getBoundingClientRect());
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  step = w < 640 ? 22 : 30;
}

function draw(t) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  const cx = w / 2, cy = h / 2, reach = Math.hypot(cx, cy), max = step * .42;
  const ox = (w % step) / 2 + step / 2, oy = (h % step) / 2 + step / 2;
  for (let y = oy; y < h; y += step) for (let x = ox; x < w; x += step) {
    const d = Math.hypot((x - cx) * .8, y - cy) / reach;
    const edge = Math.min(1, Math.max(0, (d - .22) / .6));
    const wave = .5 + .5 * Math.sin(d * 14 - t * .0011);
    const r = max * edge * edge * (.3 + .7 * wave);
    if (r < .6) continue;
    ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fill();
}

function loop(t) {
  if (!running) return;
  draw(t);
  frame = requestAnimationFrame(loop);
}

function play(on) {
  if (still || on === running) return;
  running = on;
  if (on) frame = requestAnimationFrame(loop); else cancelAnimationFrame(frame);
}

size(); draw(0);
addEventListener("resize", () => { size(); draw(performance.now()); });
new IntersectionObserver(([e]) => play(e.isIntersecting)).observe(canvas);
