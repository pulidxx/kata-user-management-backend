const { Pool, Client, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;
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
