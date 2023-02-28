const router = require("express").Router();
const db = require("../db");
const {
  generateUserToken,
  hashUserPassword,
  getTokenExpirationTime,
} = require("./util");

router.get("/sanity", async (_, res) => {
  console.log("[LOG] - Sanity test request - users route");
  res.status(200).json({ message: "backend is alive - users route" });
});

router.post("/new", async (req, res) => {
  console.log(`[LOG] - Attempting to create new user: ${req.body?.name}`);

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

  await db.createUser(name, hashUserPassword(password), token, expireTime);

  console.log(`[LOG] - User '${name}' was created and logged in`);

  res.status(200).json({
    token,
    expireTime,
    name,
  });
});

router.post("/login", async (req, res) => {
  console.log(`[LOG] - Attempting to login user: ${req.body?.name}`);

  const { name, password } = req.body;

  const checkUserHash = async () => {
    const userData = await db.getNameAndHash(name);

    return !(
      !userData ||
      userData.user_name !== name ||
      userData.user_hash !== hashUserPassword(password).toString()
    );
  };

  if (!name || !password || !(await checkUserHash()))
    return res.json({ error: "invalid user/pass" });

  // get user expiration time
  const expireTime = getTokenExpirationTime(new Date().getTime());

  // generate token
  const token = generateUserToken();

  await db.loginUser(name, token, expireTime);

  res.status(200).json({
    token,
    expireTime,
  });
});

router.get("/test-token", async (req, res) => {
  const { name, token } = req.headers;

  const invalidToken = () =>
    res.status(404).json({ error: "invalid or expired token" });

  if (!name || !token) return invalidToken();

  const userTokenData = await db.getTokenData(name);
  if (!userTokenData) return invalidToken();

  // check token is valid
  if (userTokenData.user_token !== token) return invalidToken();

  // check token isn't expired
  const now = new Date().getTime();
  if (now > userTokenData.user_expire) return invalidToken();

  res.status(200).json({ message: "token is valid" });
});

router.get("/user/:name", async (req, res) => {
  const userData = await db.getAllData(req.params.name);
  res.json(userData);
});

module.exports = router;
