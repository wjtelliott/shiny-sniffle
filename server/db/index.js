const { Pool } = require("pg");
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// DEFAULT QUERIES
const query = async (text, params) => await client.query(text, params);
const queryWithError = async (text, params) => {
  /**
   * Use this query to create or insert data.
   * This will return false if there was an error in the request
   */
  let error = false;
  await client.query(text, params).catch((_) => (error = true));
  return !error;
};

// USER QUERIES
const userQueries = {};

userQueries["userExists"] = async (name) => {
  const response = await query(
    "SELECT user_name FROM users WHERE user_name=$1",
    [name]
  );
  return response?.rows?.length > 0;
};

userQueries["createUser"] = async (
  name,
  pwd,
  hash = "nulltoken",
  expireTime = "0"
) => {
  if (await userQueries.userExists(name)) return false;
  return await queryWithError(
    "INSERT INTO users (user_name, user_hash, user_token, user_expire) VALUES ($1, $2, $3, $4)",
    [name, pwd, hash, expireTime]
  );
};

userQueries["loginUser"] = async (name, token, time) => {
  return await queryWithError(
    "UPDATE users SET user_token = $1, user_expire = $2 WHERE user_name = $3",
    [token, time, name]
  );
};

userQueries["logoutUser"] = async (name) =>
  await userQueries.loginUser(name, "nulltoken", "0");

// {
//   return await queryWithError(
//     "UPDATE users SET user_token = $1, user_expire = $2 WHERE user_name = $3",
//     ["nulltoken", "0", name]
//   );
// };

//! unused
userQueries["checkPassword"] = async (name, pwd) => {
  const response = await query(
    "SELECT user_hash FROM users WHERE user_name=$1",
    [name]
  );

  return response?.rows?.[0]?.user_hash === pwd;
};

userQueries["getNameAndHash"] = async (name) => {
  const response = await query(
    "SELECT user_name, user_hash FROM users WHERE user_name=$1",
    [name]
  );
  return response?.rows?.[0];
};

userQueries["getTokenData"] = async (name) => {
  const response = await query(
    "SELECT user_token, user_expire FROM users WHERE user_name=$1",
    [name]
  );
  return response?.rows?.[0];
};

userQueries["deleteUser"] = async (name) => {
  await query("DELETE FROM users WHERE user_name=$1", [name]);
};

userQueries["changePassword"] = async (name, newHash) => {
  return await queryWithError(
    "UPDATE users SET user_hash = $1 WHERE user_name = $2",
    [newHash, name]
  );
};

userQueries["getAllData"] = async (name) => {
  const response = await query("SELECT * FROM users WHERE user_name=$1", [
    name,
  ]);
  return response;
};

userQueries["deleteUser"] = async (name, token) => {
  await query("DELETE FROM users WHERE user_name=$1 AND user_token=$2", [
    name,
    token,
  ]);
};

module.exports = {
  query,
  queryWithError,
  ...userQueries,
};
