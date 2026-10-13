import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export const THEME_KEY = "resume-rag:theme";
export const DETAILS_KEY = "resume-rag:details";

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the preference still applies for this visit.
  }
}

function initialTheme(): Theme {
  const stored = readStorage(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

interface Preferences {
  theme: Theme;
  toggleTheme: () => void;
  showDetails: boolean;
  setShowDetails: (value: boolean) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [showDetails, setShowDetailsState] = useState(() => readStorage(DETAILS_KEY) === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    writeStorage(THEME_KEY, next);
    setTheme(next);
  }, [theme]);

  const setShowDetails = useCallback((value: boolean) => {
    writeStorage(DETAILS_KEY, String(value));
    setShowDetailsState(value);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, showDetails, setShowDetails }),
    [theme, toggleTheme, showDetails, setShowDetails],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
