import { gh } from "./gh.ts";

interface Contributor { login: string; html_url: string; avatar_url: string; type: string }

const section = document.getElementById("contributors")!;
const list = document.getElementById("people")!;

gh<Contributor[]>("repos/yumedots/dotfiles/contributors?per_page=24").then(people => {
  for (const { login, html_url, avatar_url, type } of people) {
    if (type !== "User") continue;
    const li = document.createElement("li"), a = document.createElement("a"), img = new Image(64, 64);
    a.href = html_url; a.title = login; a.setAttribute("aria-label", login);
    // Requested at 4x the 64px it shows, so it stays sharp.
    img.alt = "";
    img.src = `${avatar_url}${avatar_url.includes("?") ? "&" : "?"}s=256`;
    a.append(img); li.append(a); list.append(li);
  }
  section.hidden = !list.children.length;
}).catch(() => {});
