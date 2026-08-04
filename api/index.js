// Replace the pg driver with Neon's serverless driver (WebSocket/HTTP, not raw TCP).
// MUST happen before any TypeORM/DataSource import.
const { Pool, Client, neonConfig } = require("@neondatabase/serverless");
neonConfig.fetchConnectionCache = true;

const pg = require("pg");
pg.Pool = Pool;
pg.Client = Client;

require("reflect-metadata");

const { app } = require("../dist/app");
const { AppDataSource } = require("../dist/ormconfig");

AppDataSource.initialize()
  .then(() => console.log("Database connected (Vercel)"))
  .catch((err) => console.error("Database connection error:", err));

module.exports = app;
