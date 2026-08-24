import { Stack, Typography } from "@mui/material";

export function EmptyState() {
  return (
    <Stack
      alignItems="center"
      spacing={1}
      sx={{ py: 4, opacity: 0.8, justifyContent: "center" }}
    >
      <Typography variant="h5">No tabs parked here yet</Typography>
      <Typography variant="body2" color="text.secondary">
        Save a link, set a revisit time, and forget about it until it matters.
      </Typography>
    </Stack>
  );
}
