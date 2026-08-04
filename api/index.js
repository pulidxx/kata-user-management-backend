require("reflect-metadata");

const { app } = require("../dist/app");
const { AppDataSource } = require("../dist/ormconfig");

AppDataSource.initialize()
  .then(() => console.log("Database connected (Vercel)"))
  .catch((err) => console.error("Database connection error:", err));

module.exports = app;
