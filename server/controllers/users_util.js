const crypt = require("crypto");
const getTokenExpirationTime = (time) => time + 1000 * 60 * 60; // one hour
const saltUser = (pwd, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < pwd.length; i++) {
    ch = pwd.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
const createHash = (input, salt = "salty?", type = "sha256") => {
  const hash = crypt.createHash(type);
  hash.update(input + salt);
  return hash.digest("hex");
};
const generateUserToken = () => {
  const str = [...Array(Math.floor(Math.random() * 70) + 15).keys()]
    .map((_) => Math.floor(Math.random() * 16) + 106)
    .map((el) => String.fromCharCode(el))
    .join("");
  const seed = Math.floor(Math.random() * 150) + 96;

  // We can use the same 53bit hash for the token
  return saltUser(str, seed);
};

const checkUserPasswordMatch = (
  userName,
  userEnteredPassword,
  userPasswordHash
) => {
  // if hash is null, or name is null, false
  if (!userName?.trim() || !userEnteredPassword?.trim()) return false;

  // salt with 53hash of name
  const salt = saltUser(userName);
  // create hash of entered password
  const hash = createHash(userEnteredPassword, salt);
  return hash === userPasswordHash;
};

const sendErrorMessage = (res, msg, code = 404) => {
  return res.status(code).json({ error: msg });
};

const log = async (prefix, msg) => {
  // Don't log in test mode
  if (process.env.NODE_ENV === "test") return;
  process.stdout.write(`${prefix} /> ${msg}\n`);
};

const isValidToken = async (name, token, db) => {
  if (!name || !token) return false;
  const userTokenData = await db.getTokenData(name);
  if (!userTokenData) return false;
  if (
    userTokenData.user_token != token?.toString() ||
    new Date().getTime() > userTokenData.user_expire
  )
    return false;
  return true;
};

module.exports = {
  getTokenExpirationTime,
  saltUser,
  generateUserToken,
  createHash,
  checkUserPasswordMatch,
  sendErrorMessage,
  log,
  isValidToken,
};
