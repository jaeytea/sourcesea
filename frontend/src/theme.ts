import { createTheme } from "@mui/material/styles";

// Token system — every color in the app should trace back to one of these.
const palette = {
  background: "#FFF6F0", // soft peach-cream, page background
  surface: "#FFFFFF", // cards / dialogs
  primary: "#FF8C69", // salmon peach — primary actions
  primaryDark: "#E86F4C",
  accent: "#FFC9B3", // light peach — chips, hover states
  ink: "#4A3B35", // warm near-black for text
  inkMuted: "#8C7268", // secondary text
  danger: "#E2685A", // delete / overdue
  success: "#7FAE8E", // done / muted sage, deliberately not peach so status reads clearly
};

export const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: palette.background, paper: palette.surface },
    primary: {
      main: palette.primary,
      dark: palette.primaryDark,
      contrastText: "#FFFFFF",
    },
    secondary: { main: palette.accent, contrastText: palette.ink },
    error: { main: palette.danger },
    success: { main: palette.success },
    text: { primary: palette.ink, secondary: palette.inkMuted },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Times New Roman", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Quicksand", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Quicksand", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Quicksand", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Quicksand", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Quicksand", sans-serif', fontWeight: 600 },
    button: {
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999 }, // pill buttons feel softer/peachier
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});
