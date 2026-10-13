import { Moon, Sun } from "lucide-react";
import { usePreferences } from "../../hooks/usePreferences";
import { iconButtonClass } from "../ui";

export function ThemeToggle() {
  const { theme, toggleTheme } = usePreferences();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={iconButtonClass}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
