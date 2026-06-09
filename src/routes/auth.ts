import { Router } from "express";
import { AuthController } from "../modules/auth/controllers/auth.controller";
import { authMiddleware, validateBody } from "../middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../modules/auth/dtos/auth.dtos";

const router = Router();
const authController = new AuthController();

router.post("/register", validateBody(registerSchema), authController.register);

router.post("/login", validateBody(loginSchema), authController.login);

router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

router.get("/me", authMiddleware, authController.me);

router.post("/logout", authMiddleware, authController.logout);

export default router;
