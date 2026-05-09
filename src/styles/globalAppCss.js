/**
 * Global CSS — uses EnVault CSS variables (see theme/palettes + ThemeProvider).
 */
export const globalAppCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--ev-bg-app);
    color: var(--ev-text-primary);
    transition: background 0.2s ease, color 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @media (min-width: 768px) {
    .pathGrid3 { grid-template-columns: repeat(3, 1fr) !important; }
    .statGrid4 { grid-template-columns: repeat(4, 1fr) !important; }
  }
  @media (max-width: 899px) {
    .splitResponsive { grid-template-columns: 1fr !important; height: auto !important; min-height: 0 !important; }
  }
  .workspaceFleetGrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 8px;
  }
  @media (min-width: 640px) {
    .workspaceFleetGrid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .workspaceFleetGrid { grid-template-columns: repeat(3, 1fr); }
  }
  .pathGrid3 button[type="button"]:hover {
    border-color: var(--ev-accent-blue-muted-border) !important;
    box-shadow: 0 4px 16px rgba(59,130,246,.1) !important;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--ev-border-dashed); border-radius: 3px; }
  .approvalCard:hover { box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .statCard:hover { box-shadow: var(--ev-shadow-card-hover); }
  input:focus, textarea:focus, select:focus {
    border-color: var(--ev-border-focus) !important;
    box-shadow: var(--ev-focus-ring);
  }
`;
