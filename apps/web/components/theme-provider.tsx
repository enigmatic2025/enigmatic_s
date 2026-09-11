"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light/dark via a class on <html>. Defaults to the visitor's system; a choice made with the toggle is remembered. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
