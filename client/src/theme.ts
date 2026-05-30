import { createTheme, type ThemeOptions } from "@mui/material/styles";

const shared: ThemeOptions = {
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
        root: ({ theme }) => ({
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          border: `3px solid ${theme.palette.divider}`,
        }),
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
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
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    primary: {
      main: "#5b8def",
      contrastText: "#fff",
    },
    secondary: {
      main: "#212636",
      contrastText: "#e8eaf0",
    },
    success: {
      main: "#3dcf8e",
      contrastText: "#0d0f14",
    },
    warning: {
      main: "#f0a429",
      contrastText: "#0d0f14",
    },
    error: {
      main: "#e8604c",
      contrastText: "#fff",
    },
    background: {
      default: "#0d0f14",
      paper: "#13161e",
    },
    text: {
      primary: "#e8eaf0",
      secondary: "#9ba3b8",
    },
    divider: "#2a2f3d",
  },
  components: {
    ...shared.components,
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          border: "3px solid #2a2f3d",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#13161e",
          borderRight: "2px solid #2a2f3d",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#13161e",
          borderBottom: "2px solid #2a2f3d",
          boxShadow: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "#2a2f3d",
        },
        head: {
          backgroundColor: "#1a1e28",
          color: "#9ba3b8",
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#1a1e28",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: "#353b4f",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#2a2f3d",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#2a2f3d",
        },
      },
    },
  },
});
