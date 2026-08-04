import { DataSource } from "typeorm";
import { User, Client, RefreshToken } from "./entities";
import dotenv from "dotenv";

dotenv.config();

function buildDbUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const user = process.env.DB_USERNAME;
  const pass = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME;
  const sslMode = process.env.DB_SSL === "true" ? "verify-full" : "disable";

  if (!host || !user || !pass || !name) {
    throw new Error(
      "Missing database environment variables. Set DATABASE_URL or DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME."
    );
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}?sslmode=${sslMode}`;
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: buildDbUrl(),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  synchronize: process.env.DB_SYNC === "true",
  logging: ["error", "warn", "query"],
  entities: [User, Client, RefreshToken],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  extra: {
    max: 5,
  },
});
