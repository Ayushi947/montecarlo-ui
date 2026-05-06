"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Theme Toggle (Dropdown)
 *
 * Used in the navbar for quick theme switching.
 * Shows Sun icon in light mode, Moon icon in dark mode.
 *
 * Matches Stitch UI: Clean, minimal dropdown with icons
 */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Theme Toggle (Button Group)
 *
 * Used in Settings page for explicit theme selection.
 * Shows all three options side by side.
 *
 * Matches Stitch UI: Settings page theme selector
 */
export function ThemeToggleGroup() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="flex gap-2">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${
              theme === value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }
          `}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Theme Toggle (Card Style)
 *
 * Alternative style showing theme previews.
 * Used for onboarding or prominent settings.
 */
export function ThemeToggleCards() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const options = [
    {
      value: "light",
      label: "Light Mode",
      description: "Standard light interface",
      icon: Sun,
      preview: "bg-gray-50 border-gray-200",
    },
    {
      value: "dark",
      label: "Dark Mode",
      description: "Dark interface variant",
      icon: Moon,
      preview: "bg-slate-900 border-slate-700",
    },
    {
      value: "system",
      label: "System",
      description: "Matches device settings",
      icon: Monitor,
      preview: "bg-gradient-to-r from-gray-50 to-slate-900 border-gray-400",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {options.map(({ value, label, description, icon: Icon, preview }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative flex flex-col items-start p-4 rounded-xl border-2 text-left
            transition-all duration-200
            ${
              theme === value
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            }
          `}
        >
          {/* Preview */}
          <div
            className={`w-full h-12 rounded-md mb-3 border ${preview}`}
          />

          {/* Content */}
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>

          {/* Selected indicator */}
          {theme === value && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
