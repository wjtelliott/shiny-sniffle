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
  log("[LOG]", "- Sanity test request - users route");
  res.status(200).json({ message: "backend is alive - users route" });
});

router.post("/new", async (req, res) => {
  log(`[LOG]`, `- Attempting to create new user: ${req.body?.name}`);

  const throwUserError = (
    msg = "There was an error creating your account."
  ) => {
    res.status(404).json({ error: msg });
  };

  const { name, password } = req.body;

  if (!name || !password)
    return throwUserError("You did not supply username or password");
  if (await db.userExists(name))
    return throwUserError("That user already exists");

  const token = generateUserToken();
  const expireTime = getTokenExpirationTime(new Date().getTime());

  await db.createUser(
    name,
    createHash(password, saltUser(name)),
    token,
    expireTime
  );

  log(`[LOG] - User '${name}' was created and logged in`);

  res.status(200).json({
    token,
    expireTime,
    name,
  });
});

router.post("/login", async (req, res) => {
  log("debug", `Attempting to login user: ${req.body?.name}`);

  const { name, password } = req.body;

  if (!name?.trim())
    return sendErrorMessage(res, "Invalid username or password");

  const userData = await db.getNameAndHash(name);

  if (!userData || !checkUserPasswordMatch(name, password, userData?.user_hash))
    return sendErrorMessage(res, "Invalid username or password");

  // get new user expiration time
  const expireTime = getTokenExpirationTime(new Date().getTime());

  // generate new token
  const token = generateUserToken();

  log("debug", "User is logged in");

  await db.loginUser(name, token, expireTime);

  res.status(200).json({
    token,
    expireTime,
  });
});

router.post("/logout", async (req, res) => {
  log("debug", `Attempting to log out user: ${req.body.name}`);

  const { name, token } = req.body;

  //check valid token
  if (!(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid or expired user token");

  //log out user
  log("debug", `User is logged out`);
  await db.logoutUser(name);

  res.status(200).json({ message: "You have been logged out." });
});

router.get("/test-token", async (req, res) => {
  const { name, token } = req.headers;

  log("debug", `User ${name} is attempting to validate their token`);

  if (!(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid or expired user token");

  log("debug", "Token is valid");

  res.status(200).json({ message: "token is valid" });
});

router.get("/user/:name", async (req, res) => {
  const userData = await db.getAllData(req.params.name);
  res.json(userData);
});

router.delete("/delete", async (req, res) => {
  const { name, token } = req.headers;
  log("debug", `Deleting user ${name}`);

  //check valid token
  if (!(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid or expired user token");

  log("debug", "User Deleted");
  await db.deleteUser(name);

  res.status(200).json({ message: "User is deleted" });
});

router.put("/password", async (req, res) => {
  const { name, token, password } = req.body;
  log("debug", `User ${name} is changing their password`);

  if (!(await isValidToken(name, token, db)))
    return sendErrorMessage(res, "Invalid or expired user token");

  await db.changePassword(name, createHash(password, saltUser(name)));
  res.status(200).json({ message: "Password changed" });
});

module.exports = router;
