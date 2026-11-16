import { gh } from "./gh.ts";

gh<{ stargazers_count: number }>("repos/yumedots/dotfiles").then(({ stargazers_count: n }) => {
  const el = document.getElementById("stars")!;
  el.textContent = new Intl.NumberFormat("en", { notation: "compact" }).format(n);
  el.hidden = false;
}).catch(() => {});
