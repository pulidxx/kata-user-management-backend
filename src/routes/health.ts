import { Router, Request, Response } from "express";
import { AppDataSource } from "../ormconfig";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const dbConnected = AppDataSource.isInitialized;

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbConnected ? "connected" : "disconnected",
  });
});

export default router;
