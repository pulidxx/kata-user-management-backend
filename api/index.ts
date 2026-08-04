import "reflect-metadata";
import { app } from "../src/app";
import { AppDataSource } from "../src/ormconfig";
import { IncomingMessage, ServerResponse } from "http";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return app(req as any, res as any);
}
