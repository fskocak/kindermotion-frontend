export const THEME_STORAGE_KEY = "kindermotion-theme";

export const THEME_MODES = ["dark", "light"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];
