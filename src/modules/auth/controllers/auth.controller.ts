import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterDto, LoginDto } from "../dtos/auth.dtos";
import { AuthenticatedRequest } from "../../../types";
import { handleError } from "../../../utils";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: RegisterDto = req.body;
      const result = await this.authService.register(dto);
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: LoginDto = req.body;
      const result = await this.authService.login(dto);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshTokens(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res
          .status(401)
          .json({
            error: {
              message: "No autenticado",
              code: "UNAUTHORIZED",
              status: 401,
            },
          });
        return;
      }
      const user = await this.authService.getCurrentUser(req.user.id);
      res.status(200).json(user);
    } catch (error) {
      handleError(error, res);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res
          .status(401)
          .json({
            error: {
              message: "No autenticado",
              code: "UNAUTHORIZED",
              status: 401,
            },
          });
        return;
      }
      await this.authService.logout(req.user.id);
      res.status(200).json({ message: "Sesión cerrada" });
    } catch (error) {
      handleError(error, res);
    }
  };
}
