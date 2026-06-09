import { DataSource } from "typeorm";
import { User, Client, RefreshToken } from "./entities";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_NAME",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  synchronize: process.env.NODE_ENV !== "production",
  logging:
    process.env.NODE_ENV === "development"
      ? ["error", "warn", "migration"]
      : false,
  entities: [User, Client, RefreshToken],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});
