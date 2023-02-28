const router = require("express").Router();
const db = require("../db");

router.get("/sanity", async (_, res) => {
  console.log("Sanity test request - users route");
  res.status(OK).json({ message: "backend is alive - users route" });
});

router.post("/login", async (req, res) => {
  console.log("Attempting to login");

  const { name, password } = req.body;

  if (!name || !password) return res.json({ error: "invalid user/pass" });

  // get user time
  const now = new Date().getTime();
  const loginTime = 1000 * 60 * 60; // one hour
  const expireTime = now + loginTime;

  // generate token
  const token = 12345; // placeholder

  db.loginUser(name, token, expireTime);

  res.json({
    token,
    expireTime,
  });
});

router.get("/user/:id", async (req, res) => {});

module.exports = router;

const date = new Date().getTime();
console.log(date);
const future = date + 1000 * 60 * 60;

console.log(new Date(date));
console.log(new Date(future));
