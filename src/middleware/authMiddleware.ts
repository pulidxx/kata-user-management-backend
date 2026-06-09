import { Response, NextFunction } from "express";
import { AuthenticatedRequest, JwtPayload } from "../types";
import { UserRepository } from "../modules/users/repositories/user.repository";
import { verifyAccessToken, errors, handleError } from "../utils";

const userRepository = new UserRepository();

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw errors.unauthorized();
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw errors.unauthorized();
    }

    let payload: JwtPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw errors.unauthorized();
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw errors.unauthorized();
    }

    req.user = user;
    next();
  } catch (error) {
    handleError(error, res);
  }
};
