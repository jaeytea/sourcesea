import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    customBackgrounds: {
      multiRadial: string;
    };
  }
  interface PaletteOptions {
    customBackgrounds?: {
      multiRadial?: string;
    };
  }
}
const palette = {
  fallbackBackground: "#FFF6F0",
  darkFallbackBackground: "#1D1715",
  backgrounds: {
    "multi-radial": `
      radial-gradient(circle at 15% 20%, #ffd6ec 0 4%, transparent 5%),
      radial-gradient(circle at 85% 25%, #d9f7ff 0 4%, transparent 5%),
      radial-gradient(circle at 75% 80%, #fff0b8 0 3%, transparent 4%),
      #FFF6F0
    `
      .trim()
      .replace(/\s+/g, " "),
  },
  darkBackgrounds: {
    "multi-radial": `
      radial-gradient(circle at 15% 20%, #493039 0 4%, transparent 5%),
      radial-gradient(circle at 85% 25%, #263b43 0 4%, transparent 5%),
      radial-gradient(circle at 75% 80%, #4b422d 0 3%, transparent 4%),
      #1D1715
    `
      .trim()
      .replace(/\s+/g, " "),
  },

  surface: "#FFFFFF", // cards / dialogs
  primary: "#FF8C69", // salmon peach — primary actions
  primaryDark: "#E86F4C",
  accent: "#FFC9B3", // light peach — chips, hover states
  ink: "#4A3B35", // warm near-black for text
  inkMuted: "#8C7268", // secondary text
  danger: "#E2685A", // delete / overdue
  success: "#7FAE8E", // done / muted sage, deliberately not peach so status reads clearly
};

export function createAppTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark
          ? palette.darkFallbackBackground
          : palette.fallbackBackground,
        paper: isDark ? "#2A211E" : palette.surface,
      },
      customBackgrounds: {
        multiRadial: isDark
          ? palette.darkBackgrounds["multi-radial"]
          : palette.backgrounds["multi-radial"],
      },
      primary: {
        main: palette.primary,
        dark: palette.primaryDark,
        contrastText: "#FFFFFF",
      },
      secondary: { main: palette.accent, contrastText: palette.ink },
      error: { main: palette.danger },
      success: { main: palette.success },
      text: {
        primary: isDark ? "#FFF6F0" : palette.ink,
        secondary: isDark ? "#CDB9B0" : palette.inkMuted,
      },
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
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            background: theme.palette.customBackgrounds.multiRadial,
            backgroundAttachment: "fixed", // Keeps spots locked in view if page scrolls
          },
        }),
      },
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
}
