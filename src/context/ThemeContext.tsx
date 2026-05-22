"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ORACLE_THEMES,
  applyThemeToDocument,
  normalizeThemeId,
  type OracleTheme,
  type ReadingWorld,
  type ThemeId,
} from "@/lib/themes";

const STORAGE_KEY = "oracle_theme";

interface ThemeContextValue {
  theme: OracleTheme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  enterWorld: (world: ReadingWorld) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "astral-void";
  return normalizeThemeId(localStorage.getItem(STORAGE_KEY));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("astral-void");

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeIdState(stored);
    applyThemeToDocument(ORACLE_THEMES[stored]);
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyThemeToDocument(ORACLE_THEMES[id]);
  }, []);

  const enterWorld = useCallback((_world: ReadingWorld) => {
    /* 色调由用户手动选择，进入解读世界不再强制换肤 */
  }, []);

  const theme = ORACLE_THEMES[themeId];

  const value = useMemo(
    () => ({ theme, themeId, setThemeId, enterWorld }),
    [theme, themeId, setThemeId, enterWorld],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
