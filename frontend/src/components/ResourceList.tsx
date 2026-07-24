import { Stack } from '@mui/material';
import { Resource } from '../types';
import { EmptyState } from './EmptyState';
import { ResourceCard } from './ResourceCard';

interface Props {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

export function ResourceList({ resources, onEdit, onDelete }: Props) {
  if (resources.length === 0) return <EmptyState />;

  return (
    <Stack spacing={2}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onEdit={() => onEdit(resource)}
          onDelete={() => onDelete(resource)}
        />
      ))}
    </Stack>
  );
}
