import { THEME_STORAGE_KEY } from "@/theme/theme";

const themeScript = `
  (function() {
    var root = document.documentElement;
    var theme = "dark";

    try {
      var storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");

      if (storedTheme === "dark" || storedTheme === "light") {
        theme = storedTheme;
      }
    } catch (error) {}

    root.dataset.theme = theme;
  })();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
