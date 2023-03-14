console.log(__dirname);
const connectionString =
  process.env.NODE_ENV === "test"
    ? require("../localTestConfig").CONNECTION_STRING
    : process.env.DATABASE_URL;

const { Pool } = require("pg");
const client = new Pool({ connectionString });

const closeConnection = () => client.end();

// DEFAULT QUERIES
const query = async (text, params) => {
  const response = await client.query(text, params);
  return response;
};
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
userQueries["updateUserToken"] = async (name, token, time) =>
  await userQueries.loginUser(name, token, time);

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
  return response?.rows?.[0];
};

userQueries["deleteUser"] = async (name, token) => {
  const a = await query(
    "DELETE FROM users WHERE user_name=$1 AND user_token=$2",
    [name, token]
  );
};

// use-case: admin & testing
userQueries["deleteUserAdmin"] = async (name) => {
  return await queryWithError("DELETE FROM users WHERE user_name=$1", [name]);
};

// LIST QUERIES

const listQueries = {};
listQueries["createList"] = async (name, listItems, listOrder) => {
  return await query(
    "INSERT INTO grocery_lists (user_id, items, route_order) VALUES ((SELECT user_id FROM users WHERE user_name=$1), $2, $3) RETURNING list_id",
    [name, listItems, listOrder]
  );
};

listQueries["getList"] = async (name, token, listId) => {
  const response = await query(
    "SELECT items, route_order FROM grocery_lists WHERE user_id=(SELECT user_id FROM users WHERE user_name=$1) AND (SELECT user_token FROM users WHERE user_name=$1)=$2 AND list_id=$3",
    [name, token, listId]
  );
  return response?.rows?.[0];
};

listQueries["getAllLists"] = async (name, token) => {
  const response = await query(
    "SELECT items, route_order FROM grocery_lists WHERE user_id=(SELECT user_id FROM users WHERE user_name=$1) AND (SELECT user_token FROM users WHERE user_name=$1)=$2",
    [name, token]
  );
  return response?.rows;
};

listQueries["deleteAllLists"] = async (name, token) => {
  return await queryWithError(
    "DELETE FROM grocery_lists WHERE user_id=(SELECT user_id FROM users WHERE user_name=$1) AND (SELECT user_token FROM users WHERE user_name=$1)=$2",
    [name, token]
  );
};

listQueries["deleteList"] = async (name, token, listId) => {
  return await queryWithError(
    "DELETE FROM grocery_lists WHERE user_id=(SELECT user_id FROM users WHERE user_name=$1) AND (SELECT user_token FROM users WHERE user_name=$1)=$2 AND list_id=$3",
    [name, token, listId]
  );
};

listQueries["updateList"] = async (
  name,
  token,
  listId,
  listItems,
  listOrder
) => {
  return await query(
    "UPDATE grocery_lists SET items=$1, route_order=$2 WHERE user_id=(SELECT user_id FROM users WHERE user_name=$3) AND (SELECT user_token FROM users WHERE user_name=$3)=$4 AND list_id=$5 RETURNING list_id",
    [listItems, listOrder, name, token, listId]
  );
};

module.exports = {
  query,
  queryWithError,
  closeConnection,
  ...userQueries,
  ...listQueries,
};
