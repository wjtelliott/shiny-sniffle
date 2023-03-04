import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  // send to db to log us out
  const nav = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    console.log("ping");
    async function logoutUser() {
      const response = await fetch("/api/logout", {
        method: "POST",
        body: JSON.stringify({
          name: window.sessionStorage.getItem("name"),
          token: window.sessionStorage.getItem("token"),
        }),
      });

      const data = await response.json();
      if (data.message === "You have been logged out.") {
        window.sessionStorage.removeItem("name");
        window.sessionStorage.removeItem("token");
      } else {
        nav("/");
      }
    }

    logoutUser();
  }, [mounted]);
  useEffect(() => {
    setMounted(true);
  }, []);

  return <p>Logging you out...</p>;
}

export default Logout;
