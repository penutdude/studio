
"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light", // Default to light before hydration
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "recipesnap-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      return storedTheme || defaultTheme;
    } catch (e) {
      // If localStorage is not available (e.g. incognito mode in some browsers)
      console.error("Failed to access localStorage for theme:", e);
      return defaultTheme;
    }
  });

  // Initialize resolvedTheme based on the current theme or system preference
  // This needs to run client-side after mount
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light"; // Default for SSR, will be corrected on client
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  });
  

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let currentThemeToApply: "light" | "dark";
    if (theme === "system") {
      currentThemeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      currentThemeToApply = theme;
    }
    
    root.classList.add(currentThemeToApply);
    setResolvedTheme(currentThemeToApply);
    
    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }

    // Listen to system theme changes if theme is 'system'
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const newSystemTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(newSystemTheme);
        setResolvedTheme(newSystemTheme);
      }
    };

    if (theme === "system") {
      mediaQuery.addEventListener("change", handleChange);
    }

    return () => {
      if (theme === "system") {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, [theme, storageKey]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
