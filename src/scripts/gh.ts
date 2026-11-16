// Reads from the GitHub REST API. A visitor gets 60 calls an hour, so:
// answers are kept in localStorage for ten minutes (after that the browser's own HTTP cache
// revalidates GitHub's ETag, and a 304 does not count against the limit);
// if the network or the limit fails, the last answer is used. Callers of one path share one request.
const TTL = 10 * 60e3;
const pending = new Map<string, Promise<any>>();

export function gh<T = any>(path: string): Promise<T> {
  if (!pending.has(path)) pending.set(path, load(path));
  return pending.get(path)!;
}

async function load(path: string) {
  const key = `gh:${path}`;
  let hit: { at: number; data: any } | null = null;
  try { hit = JSON.parse(localStorage.getItem(key)!); } catch {}
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  try {
    const res = await fetch(`https://api.github.com/${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch {}
    return data;
  } catch (err) {
    if (hit) return hit.data;
    throw err;
  }
}
