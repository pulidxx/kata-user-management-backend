import express from "express";
import request from "supertest";
jest.mock("../../src/ormconfig", () => ({
  AppDataSource: {
    isInitialized: false,
  },
}));

import healthRoutes from "../../src/routes/health";

describe("health route", () => {
  it("responde estado y conexión de base de datos", async () => {
    const app = express();
    app.use("/health", healthRoutes);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.database).toBe("disconnected");
  });
});
