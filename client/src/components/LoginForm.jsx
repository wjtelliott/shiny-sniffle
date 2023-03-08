import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  getRememberedName,
  removeRememberedName,
  setRememberedName,
  setSessionInfo,
  isLoggedIn,
} from "./StorageUtil";

const theme = createTheme();

export default function SignIn() {
  const nav = useNavigate();

  const [rememberedName, _] = useState(getRememberedName());
  const [userInputName, setUserInputName] = useState(getRememberedName());
  const [loginResponse, setLoginResponse] = useState({});

  const handleRememberme = async (event) => {
    const isChecked = event?.target?.checked;
    isChecked ? setRememberedName(userInputName) : removeRememberedName();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const [name, password] = [formData.get("name"), formData.get("password")];

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const responseData = await response.json();

    // Successful login attempt if we are supplied a token
    if (responseData?.token) {
      setSessionInfo({
        name,
        token: responseData.token,
        expire: responseData.expireTime,
      });
      nav("/");
    } else {
      setLoginResponse({
        error: true,
        helperText: "Invalid Username or Password",
      });
    }
  };

  useEffect(() => {
    if (isLoggedIn()) nav("/");
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
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography
            component="h1"
            variant="h5"
            sx={{ margin: "auto!important" }}
          >
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Username"
              name="name"
              autoComplete="name"
              autoFocus
              defaultValue={rememberedName}
              onChange={(e) => setUserInputName(e?.target?.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...loginResponse}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  onClick={handleRememberme}
                  {...{ defaultChecked: rememberedName != null }}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Link onClick={(_) => nav("/")}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
