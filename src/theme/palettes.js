/**
 * Design palettes — flat tokens mapped to CSS variables by ThemeProvider.
 * Atomic layer + createAppStyles consume var(--ev-*).
 * Last modified: 2026-05-09 — Cursor Agent
 * Completeness: 88/100
 */

export const lightPalette = {
  fontSans: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  fontSerif: "'DM Serif Display', Georgia, serif",
  fontMono: "'IBM Plex Mono', ui-monospace, monospace",

  bgApp: "#f8f7f4",
  bgPanel: "#ffffff",
  bgSubtle: "#f8fafc",
  bgMuted: "#f1f5f9",
  bgChip: "#f8f7f4",
  bgNavActive: "#f1f5f9",
  bgQueue: "#fdfdfd",
  bgDiffUpdate: "#fffff8",
  bgDiffAdd: "#f0fff4",
  bgDiffRemove: "#fff5f5",
  bgDiffGenerate: "#f5f3ff",
  bgTrust: "#f0fdf4",
  bgRulesExplainer: "#fffbeb",
  bgModalTint: "rgba(15,30,61,.5)",
  bgOverlay: "rgba(15,30,61,.5)",
  bgToastWarn: "#78350f",
  bgCalloutInfo: "#f0f9ff",
  bgCalloutInfoBorder: "#bae6fd",
  bgCalloutInfoTitle: "#0c4a6e",
  bgCalloutInfoText: "#0369a1",

  textPrimary: "#0f1e3d",
  textSecondary: "#475569",
  textMuted: "#64748b",
  textSubtle: "#94a3b8",
  textOnBrand: "#ffffff",
  textLink: "#3b82f6",

  borderDefault: "#e8edf5",
  borderHairline: "#f1f5f9",
  borderInput: "#e2e8f0",
  borderDashed: "#cbd5e1",
  borderTrust: "#bbf7d0",
  borderFocus: "#3b82f6",

  brand: "#0f1e3d",
  inverseBg: "#0f1e3d",
  inverseFg: "#ffffff",

  toastBg: "#0f1e3d",
  toastFg: "#ffffff",

  accentBlue: "#3b82f6",
  accentOrange: "#f97316",
  accentGreen: "#10b981",
  accentRose: "#f43f5e",
  accentViolet: "#8b5cf6",
  accentCyan: "#06b6d4",

  accentRoseMutedBorder: "#fecdd3",
  accentBlueMutedBorder: "#bfdbfe",
  selectionTintBlue: "#eff6ff",
  toggleTrackOff: "#cbd5e1",

  rulesExplainerBg: "#fffbeb",
  rulesExplainerBorder: "#fde68a",
  rulesExplainerText: "#92400e",

  navBadgeBg: "#f97316",
  navBadgeFg: "#ffffff",

  shadowCard: "0 1px 3px rgba(0,0,0,.04)",
  shadowCardHover: "0 4px 12px rgba(0,0,0,.08)",
  shadowModal: "0 24px 60px rgba(0,0,0,.18)",
  shadowToast: "0 8px 24px rgba(0,0,0,.2)",
  headerLine: "0 1px 0 #e8edf5",

  radiusSm: "4px",
  radiusMd: "6px",
  radiusLg: "8px",
  radiusXl: "10px",
  radius2xl: "12px",
  radius3xl: "14px",
  radiusFull: "9999px",

  focusRing: "0 0 0 3px rgba(59,130,246,.12)",
};

/** Dark palette scaffold — same structure; tune contrast in a later pass. */
export const darkPalette = {
  ...lightPalette,
  bgApp: "#0c1222",
  bgPanel: "#141c2f",
  bgSubtle: "#1a2438",
  bgMuted: "#243047",
  bgChip: "#1a2438",
  bgNavActive: "#243047",
  bgQueue: "#161e30",
  bgDiffUpdate: "#1f1b10",
  bgDiffAdd: "#0f1f14",
  bgDiffRemove: "#1f1214",
  bgDiffGenerate: "#1c1530",
  bgTrust: "#0f2518",
  bgRulesExplainer: "#261f0f",
  bgModalTint: "rgba(0,0,0,.65)",
  bgOverlay: "rgba(0,0,0,.65)",
  bgCalloutInfo: "#0c1e33",
  bgCalloutInfoBorder: "#1e3a5f",
  bgCalloutInfoTitle: "#93c5fd",
  bgCalloutInfoText: "#7dd3fc",

  textPrimary: "#e8edf5",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  textSubtle: "#64748b",
  textLink: "#60a5fa",

  borderDefault: "#273549",
  borderHairline: "#1e293b",
  borderInput: "#334155",
  borderDashed: "#475569",
  borderTrust: "#166534",

  brand: "#e8edf5",
  inverseBg: "#3b82f6",
  inverseFg: "#ffffff",

  toastBg: "#243047",
  toastFg: "#f1f5f9",

  accentBlue: "#60a5fa",

  accentRoseMutedBorder: "#9f1239",
  accentBlueMutedBorder: "#1e40af",
  selectionTintBlue: "#1e3a5f",
  toggleTrackOff: "#475569",

  rulesExplainerBg: "#261f0f",
  rulesExplainerBorder: "#854d0e",
  rulesExplainerText: "#fde68a",

  shadowCard: "0 1px 3px rgba(0,0,0,.4)",
};
