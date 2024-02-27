const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_reservation_db"
);
const uuid = require("uuid");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservation CASCADE;
    DROP TABLE IF EXISTS customer CASCADE;
    DROP TABLE IF EXISTS restaurant CASCADE;

    CREATE TABLE customer(
      id UUID PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE restaurant(
      id UUID PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE reservation(
      id UUID PRIMARY KEY,
      customer_id UUID REFERENCES customer(id) NOT NULL,
      restaurant_id UUID REFERENCES restaurant(id) NOT NULL,
      reservation_date DATE
    );
  `;
  await client.query(SQL);
};

const createCustomer = async (name) => {
  const SQL = `
    INSERT INTO customer(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async (name) => {
  const SQL = `
    INSERT INTO restaurant(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createReservation = async ({ restaurant_id, customer_id, reservation_date }) => {
  const SQL = `
    INSERT INTO reservation(id, customer_id, restaurant_id, reservation_date) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    customer_id,
    restaurant_id,
    reservation_date,
  ]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
    SELECT *
    FROM customer
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT *
    FROM restaurant
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchReservations = async () => {
  const SQL = `
    SELECT *
    FROM reservation
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyReservation = async (id) => {
  const SQL = `
    DELETE FROM reservation
    WHERE id = $1
  `;
  await client.query(SQL, [id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
};
