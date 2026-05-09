/**
 * CSS variable helpers — shared by ThemeProvider (paint) and createAppStyles.
 */

export function cssVarName(camelKey) {
  return `--ev-${camelKey.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}

export const v = (camelKey) => `var(${cssVarName(camelKey)})`;
