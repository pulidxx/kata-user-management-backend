import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  authRoutes,
  clientRoutes,
  userRoutes,
  healthRoutes,
  tempAdminRoutes,
} from "./routes";
import { handleError } from "./utils/error.utils";

dotenv.config();

export const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/temp", tempAdminRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Ruta no encontrada",
      code: "NOT_FOUND",
      status: 404,
    },
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  handleError(err, res);
});
