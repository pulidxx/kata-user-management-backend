import { Response } from "express";
import { ZodError } from "zod";
import { QueryFailedError } from "typeorm";
import { ApiErrorResponse } from "../types";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const createErrorResponse = (
  message: string,
  code: string,
  status: number,
  details?: Record<string, string>,
): ApiErrorResponse => ({
  error: {
    message,
    code,
    status,
    details,
  },
});

export const handleError = (error: unknown, res: Response): Response => {
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json(
        createErrorResponse(
          error.message,
          error.code,
          error.statusCode,
          error.details,
        ),
      );
  }

  if (error instanceof ZodError) {
    const details: Record<string, string> = {};
    error.issues.forEach((err) => {
      const path = err.path.join(".");
      details[path] = err.message;
    });

    const firstError = error.issues[0];
    return res
      .status(400)
      .json(
        createErrorResponse(
          firstError.message,
          "VALIDATION_ERROR",
          400,
          details,
        ),
      );
  }

  if (error instanceof QueryFailedError) {
    const dbError = error as any;

    if (dbError.code === "23505") {
      const constraintName = dbError.constraint || "";

      if (
        constraintName.includes("UQ_") ||
        dbError.detail?.includes("documentType")
      ) {
        return res
          .status(409)
          .json(
            createErrorResponse(
              "Ya existe un cliente con este tipo y número de documento.",
              "CONFLICT",
              409,
            ),
          );
      }

      if (
        constraintName.includes("email") ||
        dbError.detail?.includes("email")
      ) {
        return res
          .status(409)
          .json(
            createErrorResponse(
              "Ya existe una cuenta con este correo.",
              "CONFLICT",
              409,
            ),
          );
      }

      return res
        .status(409)
        .json(
          createErrorResponse(
            "Ya existe un registro con estos datos.",
            "CONFLICT",
            409,
          ),
        );
    }

    if (dbError.code === "23503") {
      if (dbError.table === "clients" && dbError.detail?.includes("users")) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "El usuario tiene clientes asignados. Debe reasignarlos o eliminarlos.",
              "VALIDATION_ERROR",
              400,
            ),
          );
      }

      return res
        .status(400)
        .json(
          createErrorResponse(
            "No se puede eliminar porque existen registros relacionados.",
            "VALIDATION_ERROR",
            400,
          ),
        );
    }

    console.error("Database error:", dbError);
    return res
      .status(500)
      .json(
        createErrorResponse(
          "Error en la base de datos.",
          "DATABASE_ERROR",
          500,
        ),
      );
  }

  console.error("Unhandled error:", error);
  return res
    .status(500)
    .json(
      createErrorResponse("Error interno del servidor", "INTERNAL_ERROR", 500),
    );
};

export const errors = {
  unauthorized: () => new AppError("No autenticado", "UNAUTHORIZED", 401),

  forbidden: () => new AppError("Sin permisos", "FORBIDDEN", 403),

  notFound: (resource: string) =>
    new AppError(`${resource} no encontrado`, "NOT_FOUND", 404),

  conflict: (message: string) => new AppError(message, "CONFLICT", 409),

  validation: (message: string, details?: Record<string, string>) =>
    new AppError(message, "VALIDATION_ERROR", 400, details),

  invalidCredentials: () =>
    new AppError("Correo o contraseña incorrectos.", "UNAUTHORIZED", 401),

  emailExists: () =>
    new AppError("Ya existe una cuenta con este correo.", "CONFLICT", 409),

  documentExists: () =>
    new AppError(
      "Ya existe un cliente con este tipo y número de documento.",
      "CONFLICT",
      409,
    ),

  rateLimitExceeded: () =>
    new AppError(
      "Demasiados intentos. Por favor, espera unos minutos.",
      "RATE_LIMIT_EXCEEDED",
      429,
    ),
};
