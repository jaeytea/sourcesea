import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  AppBar,
  Box,
  Container,
  Fab,
  Button,
  Snackbar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { ResourceDialog } from "./components/ResourceDialog";
import { ResourceList } from "./components/ResourceList";
import { SearchBox } from "./components/SearchBox";
import { useNotificationScheduler } from "./hooks/useNotificationScheduler";
import { useResources } from "./hooks/useResources";
import { Resource } from "./types";
import { Footer } from "./components/Footer";
import { useAuth } from "./auth/AuthContext";

interface AppProps {
  mode: "light" | "dark";
  onToggleMode: () => void;
}

export default function App({ mode, onToggleMode }: AppProps) {
  const { resources, addResource, editResource, removeResource } =
    useResources();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredResources = resources.filter((resource) =>
    [resource.title, resource.url, resource.notes ?? ""].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );

  useNotificationScheduler((count) => {
    setSnackbar(`${count} tab${count > 1 ? "s are" : " is"} due for a revisit`);
  });

  const openCreateDialog = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEditDialog = (resource: Resource) => {
    setEditing(resource);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: Parameters<typeof addResource>[0]) => {
    try {
      if (editing) {
        await editResource(editing.id, input);
      } else {
        await addResource(input);
      }
    } catch (error) {
      setSnackbar(
        error instanceof Error ? error.message : "Unable to save this tab",
      );
      throw error;
    }
  };

  const handleStatusChange = async (
    resource: Resource,
    status: Resource["status"],
  ) => {
    try {
      await editResource(resource.id, { status });
    } catch (error) {
      setSnackbar(
        error instanceof Error ? error.message : "Unable to update this tab",
      );
    }
  };

  //todo: edit this in a diff component
  const { session, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return null; // or a spinner

  if (!session) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100vh" }}
        spacing={2}
      >
        <Typography
          variant="h3"
          color="primary.main"
          sx={{ fontFamily: "sans-serif" }}
        >
          SourceSea
        </Typography>
        <Button variant="contained" onClick={signInWithGoogle}>
          Continue with Google
        </Button>
      </Stack>
    );
  }
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box component="main" sx={{ flex: 1 }}>
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar>
            {mode === "light" ? (
              <img
                src="logo.png"
                alt="Logo"
                style={{ width: 40, height: 40, marginRight: 8 }}
              />
            ) : (
              <img
                src="logo-dark.png"
                alt="Logo"
                style={{ width: 40, height: 40, marginRight: 8 }}
              />
            )}
            <Box sx={{ display: "block" }}>
              <Typography
                variant="h4"
                color="primary.main"
                sx={{
                  mb: -1,
                  flexGrow: 1,
                  fontFamily: "serif",
                  fontWeight: 700,
                  mt: 1,
                }}
              >
                SourceSea
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0, mb: 1, alignSelf: "center", fontSize: 9 }}
              >
                Park your tabs.
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip
              title={mode === "light" ? "Use dark theme" : "Use light theme"}
            >
              <IconButton
                onClick={onToggleMode}
                color="inherit"
                aria-label="Toggle theme"
              >
                {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            {/** dropdown for signout placed here */}
            <Tooltip title="Account">
              <IconButton
                color="inherit"
                aria-label="Open account menu"
                aria-controls={accountMenuAnchor ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={accountMenuAnchor ? "true" : undefined}
                onClick={(event) =>
                  setAccountMenuAnchor(
                    accountMenuAnchor ? null : event.currentTarget,
                  )
                }
                onMouseEnter={(event) =>
                  setAccountMenuAnchor(event.currentTarget)
                }
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="account-menu"
              anchorEl={accountMenuAnchor}
              open={Boolean(accountMenuAnchor)}
              onClose={() => setAccountMenuAnchor(null)}
              MenuListProps={{
                onMouseEnter: () => setAccountMenuAnchor(accountMenuAnchor),
                onMouseLeave: () => setAccountMenuAnchor(null),
              }}
            >
              <MenuItem disabled>
                {session.user.email ?? session.user.id}
              </MenuItem>
              <MenuItem onClick={signOut}>Sign out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4, pb: 12 }}>
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onCreate={openCreateDialog}
          />
          <ResourceList
            resources={filteredResources}
            onEdit={openEditDialog}
            onDelete={(resource) => removeResource(resource.id)}
            onStatusChange={handleStatusChange}
          />
        </Container>

        <Fab
          color="primary"
          onClick={openCreateDialog}
          sx={{ position: "fixed", bottom: 35, right: 32 }}
        >
          <AddIcon />
        </Fab>

        <ResourceDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          initial={editing}
        />

        <Snackbar
          open={snackbar !== null}
          autoHideDuration={5000}
          onClose={() => setSnackbar(null)}
          message={snackbar}
        />
      </Box>
      <Footer />
    </Box>
  );
}
