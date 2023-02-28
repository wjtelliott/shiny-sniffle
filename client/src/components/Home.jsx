import { Box, Typography } from "@mui/material";
import React from "react";
function Home() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h2" sx={{ marginY: 3 }}>
        Welcome, *USER*
      </Typography>
      <Typography variant="h4" sx={{ marginY: 3 }}>
        Click the menu on top to continue
      </Typography>
    </Box>
  );
}

export default Home;
