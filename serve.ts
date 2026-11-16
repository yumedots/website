// `bun serve.ts` serves dist/ (preview); `bun serve.ts dev` rebuilds it whenever src/ changes.
import { watch } from "node:fs";

// A fresh process per build, so edits to the templates in src/ are picked up.
const build = () => Bun.spawn(["bun", "build.ts"], { stdout: "ignore", stderr: "inherit" }).exited;

const dev = process.argv[2] === "dev";
let ready = build();
if (dev) {
  let timer: Timer;
  watch("src", { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { ready = ready.then(build); }, 80);
  });
}

const server = Bun.serve({
  port: 4321,
  async fetch(req) {
    await ready;
    let { pathname } = new URL(req.url);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = Bun.file(`dist${decodeURIComponent(pathname)}`);
    return (await file.exists()) && !pathname.includes("..") ? new Response(file) : new Response("Not found", { status: 404 });
  },
});
console.log(`${dev ? "dev" : "preview"} on ${server.url}`);
