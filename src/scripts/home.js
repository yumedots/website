document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
  b.classList.add("done"); setTimeout(() => b.classList.remove("done"), 1400);
}));
