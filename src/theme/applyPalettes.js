import { darkPalette, lightPalette } from "./palettes.js";
import { cssVarName } from "./cssVars.js";

export function paintThemeOnDocument(mode) {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  for (const [key, value] of Object.entries(palette)) {
    document.documentElement.style.setProperty(cssVarName(key), String(value));
  }
}
