const router = require("express").Router();
const db = require("../db");

const getTokenExpirationTime = (time) => time + 1000 * 60 * 60; // one hour

router.get("/sanity", async (_, res) => {
  console.log("Sanity test request - users route");
  res.status(200).json({ message: "backend is alive - users route" });
});

router.post("/login", async (req, res) => {
  console.log("Attempting to login");

  const { name, password } = req.body;

  if (!name || !password) return res.json({ error: "invalid user/pass" });

  // get user time
  const now = new Date().getTime();
  const expireTime = getTokenExpirationTime(now);

  // generate token
  const token = 12345; // placeholder

  await db.loginUser(name, token, expireTime);

  res.status(200).json({
    token,
    expireTime,
  });
});

router.get("/test-token", async (req, res) => {
  const { name, token } = req.headers;

  if (!name || !token)
    return res.status(404).json({ error: "invalid token or expired token" });

  const userTokenData = await db.getTokenData(name);
  if (!userTokenData) return res.status(404).json({ error: "invalid token 2" });

  // check token is valid
  if (userTokenData.user_token !== token)
    return res.status(404).json({ error: "invalid token" });

  // check token isn't expired
  const now = new Date().getTime();
  if (now > userTokenData.user_expire)
    return res.status(404).json({ error: "expired token" });

  res.status(200).json({ message: "token is valid" });
});

router.get("/user/:name", async (req, res) => {
  const userData = await db.getAllData(req.params.name);
  res.json(userData);
});

module.exports = router;
