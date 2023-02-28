const getTokenExpirationTime = (time) => time + 1000 * 60 * 60; // one hour
const hashUserPassword = (pwd, seed = 0) => {
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
const generateUserToken = () => {
  const str = [...Array(Math.floor(Math.random() * 70) + 15).keys()]
    .map((_) => Math.floor(Math.random() * 16) + 106)
    .map((el) => String.fromCharCode(el))
    .join("");
  const seed = Math.floor(Math.random() * 150) + 96;

  // We can use the same 53bit hash for the token
  return hashUserPassword(str, seed);
};

module.exports = {
  getTokenExpirationTime,
  hashUserPassword,
  generateUserToken,
};
