import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import App from "./App";
import { createAppTheme } from "./theme";

function Root() {
  const [mode, setMode] = useState<"light" | "dark">(
    () =>
      (localStorage.getItem("sourcesea-theme") as "light" | "dark") ?? "light",
  );
  const theme = createAppTheme(mode);

  const toggleMode = () => {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    localStorage.setItem("sourcesea-theme", nextMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App mode={mode} onToggleMode={toggleMode} />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
