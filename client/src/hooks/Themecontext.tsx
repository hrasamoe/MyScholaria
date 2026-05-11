import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { lightTheme, darkTheme } from "@/theme";

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("myscholaria_theme");
    if (saved) return saved === "dark";
  });
  const toggle = () => {
    setIsDark((V) => !V);
  };
  const value = useMemo(() => ({ isDark, toggle }), [isDark]);
  useEffect(() => {
    localStorage.setItem("myscholaria_theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={value}>
        <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
            <CssBaseline/>
            {children}
        </ThemeProvider>
    </ThemeContext.Provider>
  )
}
