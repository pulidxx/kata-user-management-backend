import "reflect-metadata";
import { app } from "../src/app";
import { AppDataSource } from "../src/ormconfig";

let dbInitPromise: Promise<void> | null = null;

async function ensureDatabase(): Promise<void> {
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

export default async function handler(req: any, res: any) {
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
}
