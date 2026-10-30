import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  trailingSlash: "always",
  devToolbar: { enabled: false },
  // Ship CSS inside the HTML so first paint needs no extra request.
  build: { inlineStylesheets: "always" },
  // Fonts are downloaded at build time and served from this site, with metric-matched fallbacks.
  fonts: [
    { provider: fontProviders.google(), name: "Geist", cssVariable: "--sans", weights: [400, 500, 600], subsets: ["latin"], fallbacks: ["system-ui", "sans-serif"] },
    { provider: fontProviders.google(), name: "Google Sans Code", cssVariable: "--mono", weights: [400, 500], subsets: ["latin"], fallbacks: ["ui-monospace", "monospace"] },
  ],
});
