import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://yumedots.github.io",
  base: "/website",
  // Ship CSS inside the HTML so first paint needs no extra request.
  build: { inlineStylesheets: "always" },
});
