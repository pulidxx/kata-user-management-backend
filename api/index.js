require("reflect-metadata");

const { app } = require("../dist/app");
const { AppDataSource } = require("../dist/ormconfig");

let dbInitPromise = null;

async function ensureDatabase() {
  if (AppDataSource.isInitialized) return;

  if (!dbInitPromise) {
    dbInitPromise = AppDataSource.initialize()
      .then(() => {
        console.log("Database connected (Vercel)");
      })
      .catch((err) => {
        dbInitPromise = null;
        console.error("Database connection error:", err);
        throw err;
      });
  }

  return dbInitPromise;
}

module.exports = async function handler(req, res) {
  try {
    await ensureDatabase();
  } catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          message: "Database connection failed",
          code: "DB_ERROR",
          status: 500,
        },
      })
    );
    return;
  }

  app(req, res);
};
