import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { paintThemeOnDocument } from "./applyPalettes.js";
const ThemeCtx = createContext({ mode: "light", setMode: () => {}, toggleMode: () => {} });

export function ThemeProvider({ children, defaultMode = "light" }) {
  const [mode, setMode] = useState(defaultMode);

  useEffect(() => {
    paintThemeOnDocument(mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode(m => (m === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
