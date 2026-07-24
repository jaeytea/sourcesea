import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { Resource } from '../types';

interface Props {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}

function statusChip(resource: Resource) {
  const isOverdue = resource.status === 'pending' && new Date(resource.remindAt) <= new Date();
  if (resource.status === 'done') return <Chip label="Done" color="success" size="small" />;
  if (isOverdue) return <Chip label="Due now" color="error" size="small" />;
  return <Chip label="Pending" color="secondary" size="small" />;
}

export function ResourceCard({ resource, onEdit, onDelete }: Props) {
  const remindDate = new Date(resource.remindAt);

  return (
    <Card variant="outlined" sx={{ borderColor: 'secondary.main' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap title={resource.title}>
              {resource.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              title={resource.url}
              sx={{ maxWidth: 420 }}
            >
              {resource.url}
            </Typography>
          </Stack>
          {statusChip(resource)}
        </Stack>

        {resource.notes && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {resource.notes}
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Remind at {remindDate.toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" href={resource.url} target="_blank" rel="noreferrer">
              <OpenInNewIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onEdit}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete} color="error">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
