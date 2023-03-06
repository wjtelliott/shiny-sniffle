import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import * as util from "./StorageUtil";
//import { getSessionToken, removeSessionData, isLoggedIn } from "./StorageUtil";

const theme = createTheme();

//const getSessionUsername = () => "asd";

function Logout() {
  // send to db to log us out
  const nav = useNavigate();

  const [sessionName, _] = useState(util.getSessionUsername());

  async function logoutUser() {
    const name = util.getSessionUsername();
    const token = util.getSessionToken();

    const response = await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, token }),
    });

    const data = await response.json();
    if (data?.message !== "You have been logged out.") {
      // we can probably ignore logout errors here and just
      // remove our sessions items anyway
    }
    util.removeSessionData();
    nav("/");
  }

  useEffect(() => {
    if (!util.isLoggedIn()) nav("/");
    const abortController = new AbortController();

    const logoutTimer = setTimeout(() => {
      logoutUser();
    }, 2000);

    return () => {
      clearTimeout(logoutTimer);
      abortController.abort();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Signing you out in a moment...
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="Username"
              name="name"
              autoComplete="name"
              disabled
              autoFocus
              defaultValue={sessionName}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => nav("/")}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Logout;
