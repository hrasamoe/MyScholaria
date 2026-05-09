import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "@/hooks/Themecontext";

export function ToggleTheme() {
  const { isDark, toggle } = useThemeMode();

  return (
    <Tooltip title={isDark ? "Switch to day mode" : "Swith to dark mode"}>
      <IconButton onClick={toggle} color="inherit" size="small">
        {isDark ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
