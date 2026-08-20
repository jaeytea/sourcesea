import { Box, Typography } from "@mui/material";

export function Footer() {
  return (
    <Box component="footer" sx={{ py: 2, textAlign: "center" }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: 12,
        }}
      >
        {"© "}
        {new Date().getFullYear()} SourceSea. All rights reserved.
      </Typography>
    </Box>
  );
}
