import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { UserRole } from "../entities";
import { errors, handleError } from "../utils";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw errors.unauthorized();
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw errors.forbidden();
      }

      next();
    } catch (error) {
      handleError(error, res);
    }
  };
};

export const requireAdmin = requireRole("admin");
export const requireAdminOrAsesor = requireRole("admin", "asesor");
