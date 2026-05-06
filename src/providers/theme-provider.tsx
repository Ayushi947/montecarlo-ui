"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * Theme Provider for Simulix
 *
 * Supports three modes:
 * - "light" - Light mode (Gray-50 background)
 * - "dark" - Dark mode (Slate-950 background)
 * - "system" - Auto-detect from OS preference
 *
 * Theme is persisted in localStorage under key "simulix-theme"
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="simulix-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
