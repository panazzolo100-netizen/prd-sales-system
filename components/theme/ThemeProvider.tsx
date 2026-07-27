"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";
type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = "prd-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readPreference(): ThemePreference {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  const apply = useCallback((nextPreference: ThemePreference) => {
    const nextTheme = resolveTheme(nextPreference);
    document.documentElement.classList.add("theme-transition");
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    setResolvedTheme(nextTheme);
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 220);
  }, []);

  useEffect(() => {
    const initialPreference = readPreference();
    setPreferenceState(initialPreference);
    apply(initialPreference);
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemChange = () => {
      if (readPreference() === "system") apply("system");
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, [apply]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    window.localStorage.setItem(STORAGE_KEY, nextPreference);
    setPreferenceState(nextPreference);
    apply(nextPreference);
  }, [apply]);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return context;
}
