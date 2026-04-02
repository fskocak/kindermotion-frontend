"use client";

import { useSyncExternalStore } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { THEME_MODES, THEME_STORAGE_KEY, type ThemeMode } from "@/theme/theme";

type ThemeToggleProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
};

const themeSyncEvent = "kindermotion:theme-change";

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return (
    value !== null &&
    value !== undefined &&
    THEME_MODES.includes(value as ThemeMode)
  );
}

function getThemeFromDom() {
  if (typeof document === "undefined") {
    return "dark" satisfies ThemeMode;
  }

  const activeTheme = document.documentElement.dataset.theme;

  return isThemeMode(activeTheme) ? activeTheme : "dark";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(themeSyncEvent, { detail: theme }));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(themeSyncEvent, onStoreChange);

  return () => {
    window.removeEventListener(themeSyncEvent, onStoreChange);
  };
}

export function ThemeToggle({
  className,
  size = "icon",
  showLabel = false,
}: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeFromDom,
    () => "dark" satisfies ThemeMode,
  );

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? SunMedium : MoonStar;
  const label = nextTheme === "light" ? "Light mode" : "Dark mode";

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={cn("shrink-0", className)}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
      onClick={() => {
        const updatedTheme = getThemeFromDom() === "dark" ? "light" : "dark";

        applyTheme(updatedTheme);
      }}
    >
      <Icon className="size-4" />
      {showLabel ? (
        <span suppressHydrationWarning>{label}</span>
      ) : (
        <span className="sr-only" suppressHydrationWarning>
          {label}
        </span>
      )}
    </Button>
  );
}
