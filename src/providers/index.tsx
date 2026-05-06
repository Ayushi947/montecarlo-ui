"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { GuestProvider } from "@/context/GuestContext";

/**
 * Root Providers for Simulix
 *
 * Wraps the application with:
 * - ThemeProvider (dark/light/system mode)
 * - QueryProvider (React Query for server state)
 * - Toaster (toast notifications)
 */

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <GuestProvider>
          {children}
        </GuestProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  );
}
