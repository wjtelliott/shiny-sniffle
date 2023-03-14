const router = require("express").Router();
const db = require("../db");
const {
  generateUserToken,
  saltUser,
  getTokenExpirationTime,
  createHash,
  checkUserPasswordMatch,
  sendErrorMessage,
  log,
  isValidToken,
} = require("./users_util");

router.get("/sanity", async (_, res) => {
  log("[LOG]", "- Sanity test request - lists route");
  res.status(200).json({ message: "backend is alive - lists route" });
});

router.post("/new", async (req, res) => {
  log(`[LOG]`, `User ${req.body?.name} attempting to create a new list`);

  const { name, token, listItems, listOrder } = req.body;

  if (!name || !token || !(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid user login");

  const listInfo = await db.createList(name, listItems, listOrder);

  log("debug", JSON.stringify(listInfo, null, 2));

  log(`[LOG] - List for user '${name}' was created`);

  res
    .status(201)
    .json({ message: "List created", id: listInfo?.rows?.[0]?.list_id });
});

router.put("/update", async (req, res) => {
  log(`[LOG]`, `User ${req.body?.name} attempting to update a list`);

  const { name, token, listId, listItems, listOrder } = req.body;

  if (!name || !token || !(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid user login");

  // check if list exists
  const list = await db.getList(name, token, listId);
  if (!list) return sendErrorMessage(res, "List does not exist");

  const listInfo = await db.updateList(
    name,
    token,
    listId,
    listItems,
    listOrder
  );

  log(`[LOG] - List for user '${name}' was updated`);

  res
    .status(200)
    .json({ message: "List updated", id: listInfo?.rows?.[0]?.id });
});

router.delete("/delete", async (req, res) => {
  log(`[LOG]`, `User ${req.body?.name} attempting to delete a list`);

  const { name, token, listId } = req.body;

  if (!name || !token || !(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid user login");

  // check if list exists
  const list = await db.getList(name, token, listId);
  if (!list) return sendErrorMessage(res, "List does not exist");

  await db.deleteList(name, token, listId);

  log(`[LOG] - List for user '${name}' was deleted`);

  res.status(200).json({ message: "List deleted" });
});

router.get("/", async (req, res) => {
  // return all lists for a user
  log(`[LOG]`, `User ${req.headers?.name} attempting to get all lists`);
  const { name, token } = req.headers;

  if (!name || !token || !(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid user login");

  const lists = await db.getAllLists(name, token);

  log(`[LOG]`, ` - Lists for user '${name}' were retrieved`);

  res.status(200).json({ lists });
});

router.get("/:listId", async (req, res) => {
  // return a specific list for a user
  log(`[LOG]`, `User ${req.headers?.name} attempting to get a list`);
  const { name, token } = req.headers;
  const { listId } = req.params;

  if (!name || !token || !(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid user login");

  const list = await db.getList(name, listId);
  if (!list) return sendErrorMessage(res, "List does not exist");

  log(`[LOG]`, ` - List for user '${name}' was retrieved`);

  res.status(200).json({ list });
});

module.exports = router;
