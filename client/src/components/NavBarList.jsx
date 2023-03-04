import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";

function NavBarList({ listItems, createLink }) {
  function getIcon(iconText) {
    const iconDict = {
      default: <AccountCircleIcon />,
      profile: <AccountCircleIcon />,
      list: <ReceiptLongIcon />,
      plus: <AddCircleIcon />,
      route: <AltRouteIcon />,
      home: <HomeIcon />,
    };
    return iconDict[iconText] || iconDict["default"];
  }

  function isLoggedIn() {
    const [name, token] = [
      window.sessionStorage.getItem("name"),
      window.sessionStorage.getItem("token"),
    ];
    return name != null && token != null;
  }

  return (
    <List>
      {listItems.map(({ text, icon }, index) => {
        if (text == "Login" && isLoggedIn()) return null;
        if (text == "Logout" && !isLoggedIn()) return null;
        return (
          <ListItem key={`listItem${text}${index}`} disablePadding>
            <Link
              style={{
                width: "100%",
                textDecoration: "none",
                color: "inherit",
              }}
              to={`/${createLink(text)}`}
            >
              <ListItemButton>
                <ListItemIcon>{getIcon(icon)}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </Link>
          </ListItem>
        );
      })}
    </List>
  );
}

export default NavBarList;
