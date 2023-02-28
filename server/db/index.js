const { Pool } = require("pg");
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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

userQueries["createUser"] = async (name, pwd) => {
  if (await userQueries.userExists(name)) return false;
  return await queryWithError(
    "INSERT INTO users (user_name, user_hash) VALUES ($1, $2)",
    [name, pwd]
  );
};

userQueries["loginUser"] = async (name, token, time) => {
  return await queryWithError(
    "UPDATE users SET user_token = $1, user_expire = $2 WHERE user_name = $3",
    [token, time, name]
  );
};

userQueries["checkPassword"] = async (name, pwd) => {
  const response = await query(
    "SELECT user_hash FROM users WHERE user_name=$1",
    [name]
  );

  return response?.rows?.[0]?.user_hash === pwd;
};

module.exports = {
  query,
  queryWithError,
  ...userQueries,
};
