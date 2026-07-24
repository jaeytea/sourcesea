import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CreateResourceInput, Resource } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateResourceInput) => Promise<void>;
  initial?: Resource | null; // present when editing
}

// datetime-local needs "YYYY-MM-DDTHH:mm" with no timezone suffix
function toLocalInputValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // default: +2 days
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ResourceDialog({ open, onClose, onSubmit, initial }: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [remindAt, setRemindAt] = useState(toLocalInputValue());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUrl(initial?.url ?? '');
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setRemindAt(toLocalInputValue(initial?.remindAt));
  }, [open, initial]);

  const isValid = url.trim().length > 0 && title.trim().length > 0 && remindAt.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit({
        url: url.trim(),
        title: title.trim(),
        notes: notes.trim() || undefined,
        remindAt: new Date(remindAt).toISOString(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit tab' : 'Save a tab for later'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="URL"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Title"
            placeholder="What is this?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Remind me at"
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || submitting}>
          {initial ? 'Save changes' : 'Save tab'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
