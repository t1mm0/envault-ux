/**
 * Loads EnVault typography once (atoms reference same font stacks via CSS vars).
 */
export function loadGoogleFontsOnce() {
  if (typeof document === "undefined") return;
  if (document.querySelector("#ev-fonts-envault")) return;
  const link = document.createElement("link");
  link.id = "ev-fonts-envault";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}
