import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// Every Markdown file in src/content/docs is one documentation page, in file name order.
// The file's first "## Title" names the page in the side list; "1-windows.md" is served at /docs/windows/.
export const collections = {
  docs: defineCollection({ loader: glob({ pattern: "*.md", base: "./src/content/docs" }) }),
};
