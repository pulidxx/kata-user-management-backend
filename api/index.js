require("reflect-metadata");

const { app } = require("../dist/app");
const { AppDataSource } = require("../dist/ormconfig");

AppDataSource.initialize()
  .then(() => console.log("DB CONNECTED OK"))
  .catch((err) => {
    console.error("DB CONNECT FAILED:", err?.message || err);
    if (err?.code) console.error("  code:", err.code);
    if (err?.stack) console.error("  stack:", err.stack);
  });

module.exports = app;
