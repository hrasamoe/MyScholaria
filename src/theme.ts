import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f5f5f5",
      contrastText: "#2d3748",
    },
    success: {
      main: "#2e7d32",
      contrastText: "#fff",
    },
    warning: {
      main: "#e65100",
      contrastText: "#fff",
    },
    error: {
      main: "#ef4444",
      contrastText: "#fff",
    },
    background: {
      default: "#f7f9fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#2d3748",
      secondary: "#6b7280",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          border: "1px solid #e2e8f0",
        },
      },
    },
  },
});

export default theme;
