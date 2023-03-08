import { Button, Box } from "@mui/material";
import React, { useState } from "react";
import { getSessionData } from "../StorageUtil";

function CreateList() {
  const [newListItems, setNewListItems] = useState([]);
  const [cachedItems, setCachedItems] = useState([{ name: "asdf" }]);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const { name, token } = getSessionData();

  async function handleAddNewItem(e) {
    // check if we have cached server items
    if (cachedItems.length < 1) {
      const response = await fetch("/api/items", {
        method: "GET",
        headers: { name, token },
      });
      const itemData = await response.json();
      //todo check first item for structured data type
      setCachedItems(itemData);
    }
    setOverlayVisible(true);
  }

  function closeOverlay(e) {
    setOverlayVisible(false);
  }

  function addItem(e, item) {
    setNewListItems([...newListItems, item]);
  }

  return (
    <Box>
      {overlayVisible ? (
        <Box>
          <Box>
            {cachedItems.map((item) => {
              return (
                <Button
                  sx={{ width: "25vw", fontSize: "1.5em" }}
                  onClick={(e) => addItem(e, item)}
                  variant="outlined"
                >
                  {JSON.stringify(item)}
                </Button>
              );
            })}
          </Box>
          <Button
            sx={{ m: "0 auto", display: "block", fontSize: "1.75em" }}
            onClick={closeOverlay}
            variant="contained"
          >
            Back
          </Button>
        </Box>
      ) : (
        <Box>
          <Button onClick={handleAddNewItem}>Add New Item</Button>
          {newListItems.map((item) => {
            return <p>{JSON.stringify(item)}</p>;
          })}
        </Box>
      )}
    </Box>
  );
}

export default CreateList;
