import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { handleError } from "../utils";

type ValidationType = "body" | "query" | "params";

export const validate = (schema: ZodSchema, type: ValidationType = "body") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[type];
      const parsed = schema.parse(data);

      (req as any)[type] = parsed;

      next();
    } catch (error) {
      handleError(error, res);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validate(schema, "body");
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");
export const validateParams = (schema: ZodSchema) => validate(schema, "params");
