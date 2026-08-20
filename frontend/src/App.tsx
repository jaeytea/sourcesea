import AddIcon from "@mui/icons-material/Add";
import {
  AppBar,
  Box,
  Container,
  Fab,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { ResourceDialog } from "./components/ResourceDialog";
import { ResourceList } from "./components/ResourceList";
import { SearchBox } from "./components/SearchBox";
import { useNotificationScheduler } from "./hooks/useNotificationScheduler";
import { useResources } from "./hooks/useResources";
import { Resource } from "./types";
import { Footer } from "./components/Footer";

export default function App() {
  const { resources, addResource, editResource, removeResource } =
    useResources();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box component="main" sx={{ flex: 1 }}>
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{ borderBottom: "1px solid", borderColor: "white" }}
        >
          <Toolbar>
            <img
              src="logo.png"
              alt="Logo"
              style={{ width: 40, height: 40, marginRight: 8 }}
            />
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
            {/* <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "right" }}
          >
            Username
          </Typography> */}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4, pb: 12 }}>
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
          <ResourceList
            resources={filteredResources}
            onEdit={openEditDialog}
            onDelete={(resource) => removeResource(resource.id)}
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
