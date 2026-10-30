// Live numbers from the GitHub REST API, fetched as the page opens.
// Cached for the tab session so moving between pages costs no extra calls (the API allows 60 an hour per visitor).
async function gh(path) {
  const key = `gh:${path}`;
  try { const hit = sessionStorage.getItem(key); if (hit) return JSON.parse(hit); } catch {}
  const res = await fetch(`https://api.github.com/${path}`, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
  return data;
}

gh("repos/yumedots/dotfiles").then(({ stargazers_count: n }) => {
  const el = document.getElementById("stars");
  el.textContent = new Intl.NumberFormat("en", { notation: "compact" }).format(n);
  el.hidden = false;
}).catch(() => {});

gh("users/yyyumeniku").then(({ avatar_url }) => {
  const img = document.getElementById("me");
  img.src = `${avatar_url}${avatar_url.includes("?") ? "&" : "?"}s=96`;
  img.hidden = false;
}).catch(() => {});
