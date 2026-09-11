"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Switches between light and dark. Both icons render on the server and CSS picks
 * one from the `.dark` class, so there is no flash or hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-sm border border-border-strong text-muted-foreground transition-colors duration-200 hover:border-foreground/40 hover:text-foreground",
        className
      )}
    >
      <Sun size={16} aria-hidden className="hidden dark:block" />
      <Moon size={16} aria-hidden className="dark:hidden" />
    </button>
  );
}
