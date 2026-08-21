import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { Footer } from "./Footer";

function AboutPanel() {
  return (
    <Paper component="section" elevation={0} sx={{ p: 3, height: "100%" }}>
      <Stack spacing={1.5}>
        <LightbulbOutlinedIcon color="primary" />
        <Typography variant="h6">About SourceSea</Typography>
        <Typography color="text.secondary">
          Park tabs you do not need right now, but cannot close. Add a reminder
          and SourceSea will bring them back when you are ready.
        </Typography>
      </Stack>
    </Paper>
  );
}

function GitHubPanel() {
  return (
    <Paper component="section" elevation={0} sx={{ p: 3, height: "100%" }}>
      <Stack spacing={1.5}>
        <GitHubIcon />
        <Typography variant="h6">Open source, like the web</Typography>
        <Typography color="text.secondary">
          Follow the project, inspect the code, or help make tab chaos a little
          easier to manage.
        </Typography>
        <Link
          href="https://github.com/jaeytea/sourcesea"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
        >
          View SourceSea on GitHub
        </Link>
      </Stack>
    </Paper>
  );
}

export default function Homepage({ mode, onToggleMode }) {
  const { signInWithGoogle } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "94vh",
        px: { xs: 2, md: 5 },
        py: 3,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <img
            src={mode === "light" ? "logo.png" : "logo-dark.png"}
            alt="SourceSea logo"
            style={{ width: 40, height: 40 }}
          />
          <Typography variant="h5" color="primary.main">
            SourceSea
          </Typography>
        </Stack>
        <Tooltip
          title={mode === "light" ? "Use dark theme" : "Use light theme"}
        >
          <IconButton onClick={onToggleMode} aria-label="Toggle theme">
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack
        alignItems="center"
        spacing={3}
        sx={{ maxWidth: 880, mx: "auto", pt: { xs: 8, md: 11 }, pb: 5 }}
      >
        <Stack alignItems="center" spacing={1} sx={{ textAlign: "center" }}>
          <Typography variant="h2" color="primary.main">
            Park your tabs.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
            Save the things you want to revisit without keeping them open.
          </Typography>
        </Stack>

        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={signInWithGoogle}
          sx={{ px: 3, py: 1.25 }}
        >
          Continue with Google
        </Button>

        <Divider flexItem sx={{ my: 2 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            width: "100%",
          }}
        >
          <AboutPanel />
          <GitHubPanel />
        </Box>
      </Stack>
      <br />
      <br />
      <div style={{ mt: 1 }}>
        <Footer />
      </div>
    </Box>
  );
}
