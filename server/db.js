const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

async function createTables()  {
  const SQL = `
    DROP TABLE IF EXISTS user_favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(55) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL
    );
    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    );
    CREATE TABLE user_favorites(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      product_id UUID REFERENCES products(id) NOT NULL,
      CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
    );
  `;
  await client.query(SQL);
};

async function createUser({ username, password }) {
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

async function createProduct({ name }) {
  const SQL = `
    INSERT INTO products(id, name) VALUES ($1, $2) RETURNING * 
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

async function createUserFavorite({ user_id, product_id }) {
  const SQL = `
    INSERT INTO user_favorites(id, user_id, product_id) VALUES ($1, $2, $3) RETURNING * 
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

async function fetchUsers() {
  const SQL = `
    SELECT id, username 
    FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

async function fetchProducts() {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

async function fetchUserFavorites(user_id) {
  const SQL = `
    SELECT *
    FROM user_favorites
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

async function deleteUserFavorite({ user_id, id }) {
  const SQL = `
    DELETE
    FROM user_favorites
    WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [user_id, id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createUserFavorite,
  fetchUserFavorites,
  deleteUserFavorite,
};
