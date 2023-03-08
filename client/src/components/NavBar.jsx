import React, { useState } from "react";
import {
  Box,
  Button,
  SwipeableDrawer,
  Divider,
  Typography,
} from "@mui/material";
import NavBarSvg from "./NavBarSvg";
import NavBarList from "./NavBarList";
import constants from "../Constants";
const { NAVBAR_OPTIONS, NAVBAR_TITLE } = constants;

function NavBar() {
  // We can let the menu open multiple directions, left by default
  const [drawerState, setDrawerState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawerStates = (anchor, open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerState({ ...drawerState, [anchor]: open });
  };

  const toggleDrawer = () => (event) => {
    const defaultDrawerPosition = "left";
    toggleDrawerStates(
      defaultDrawerPosition,
      !drawerState[defaultDrawerPosition]
    )(event);
  };

  const createLink = (text) => {
    if (text.trim().toLowerCase() === "home") return "";
    return text.replace(" ", "-").trim().toLowerCase();
  };

  const formattedDrawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer()}
      onKeyDown={toggleDrawer()}
    >
      {NAVBAR_OPTIONS.map((navGroupOptions, index) => (
        <Box key={`navListGroup${index}`}>
          <NavBarList listItems={navGroupOptions} createLink={createLink} />
          {index < NAVBAR_OPTIONS.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{ textAlign: "left", padding: 1, marginBottom: 4 }}
      id="navbar-container"
    >
      <Button onClick={toggleDrawer()} sx={{ borderRadius: "100%" }}>
        <NavBarSvg />
      </Button>
      <Typography variant="h1">{NAVBAR_TITLE}</Typography>
      <SwipeableDrawer
        anchor={"left"}
        open={drawerState["left"]}
        onClose={toggleDrawer()}
        onOpen={toggleDrawer()}
      >
        {formattedDrawer}
      </SwipeableDrawer>
    </Box>
  );
}

export default NavBar;
