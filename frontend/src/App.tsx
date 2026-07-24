import AddIcon from '@mui/icons-material/Add';
import { AppBar, Container, Fab, Snackbar, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { ResourceDialog } from './components/ResourceDialog';
import { ResourceList } from './components/ResourceList';
import { useNotificationScheduler } from './hooks/useNotificationScheduler';
import { useResources } from './hooks/useResources';
import { Resource } from './types';

export default function App() {
  const { resources, addResource, editResource, removeResource } = useResources();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useNotificationScheduler((count) => {
    setSnackbar(`${count} tab${count > 1 ? 's are' : ' is'} due for a revisit`);
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
    if (editing) {
      await editResource(editing.id, input);
    } else {
      await addResource(input);
    }
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'secondary.main' }}>
        <Toolbar>
          <Typography variant="h4" color="primary.main" sx={{ flexGrow: 1 }}>
            SourceSea
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Park a tab. Get it back when it matters.
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4, pb: 12 }}>
        <ResourceList
          resources={resources}
          onEdit={openEditDialog}
          onDelete={(resource) => removeResource(resource.id)}
        />
      </Container>

      <Fab
        color="primary"
        onClick={openCreateDialog}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
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
    </>
  );
}
