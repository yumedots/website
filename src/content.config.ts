import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// Every Markdown file in src/content/docs is part of the documentation, in file name order.
// Each "## Title" inside a file becomes a chapter in the side list.
export const collections = {
  docs: defineCollection({ loader: glob({ pattern: "*.md", base: "./src/content/docs" }) }),
};
