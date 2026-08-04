const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;


const pg = require("pg");
pg.Pool = Pool;

pg.Client = require("@neondatabase/serverless").Client;


require("reflect-metadata");

const { app } = require("../dist/app");
const { AppDataSource } = require("../dist/ormconfig");

console.log("Starting DB init...");
AppDataSource.initialize()
  .then(() => {
    console.log("DB CONNECTED OK, isInitialized:", AppDataSource.isInitialized);
    return AppDataSource.query("SELECT 1 AS test");
  })
  .then((result) => console.log("DB TEST QUERY OK:", JSON.stringify(result)))
  .catch((err) => {
    console.error("DB INIT FAILED:");
    console.error("  message:", err?.message || "(no message)");
    console.error("  typeof:", typeof err);
    console.error("  constructor:", err?.constructor?.name);
    if (err?.type) console.error("  type:", err.type);
    if (err?.code) console.error("  code:", err.code);
    if (err?.stack) console.error("  stack:", err.stack);
  });

module.exports = app;
