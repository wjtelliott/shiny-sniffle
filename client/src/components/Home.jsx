import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getSessionUsername } from "./StorageUtil";

function Home() {
  const [userName, setUserName] = useState(getSessionUsername());

  useEffect(() => {}, []);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h2" sx={{ marginY: 3 }}>
        Welcome, {userName ?? "User"}
      </Typography>
      <Typography variant="h4" sx={{ marginY: 3 }}>
        Click the menu on top to continue
      </Typography>
    </Box>
  );
}

export default Home;
