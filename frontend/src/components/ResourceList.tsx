import { Box } from "@mui/material";
import { Resource } from "../types";
import { EmptyState } from "./EmptyState";
import { ResourceCard } from "./ResourceCard";

interface Props {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onStatusChange: (resource: Resource, status: Resource["status"]) => void;
}

export function ResourceList({
  resources,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  if (resources.length === 0) return <EmptyState />;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        py: 2,
        alignItems: "stretch",
        width: "100%",
      }}
    >
      {resources.map((resource) => (
        <Box
          key={resource.id}
          sx={{
            flex: "1 1 280px",
            minWidth: { xs: "100%", sm: 280 },
            maxWidth: { xs: "100%", md: "calc(50% - 8px)" },
          }}
        >
          <ResourceCard
            resource={resource}
            onEdit={() => onEdit(resource)}
            onDelete={() => onDelete(resource)}
            onStatusChange={(status) => onStatusChange(resource, status)}
          />
        </Box>
      ))}
    </Box>
  );
}
