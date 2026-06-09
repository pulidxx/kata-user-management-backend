import { Response, Request } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto, UpdateUserDto, ChangeRoleDto } from "../dtos/user.dtos";
import { AuthenticatedRequest } from "../../../types";
import { handleError } from "../../../utils";
import { AppDataSource } from "../../../ormconfig";
import { User } from "../../../entities/User";
import { hashPassword } from "../../../utils/password.utils";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.userService.getAllUsers();
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  createUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const dto: CreateUserDto = req.body;
      const result = await this.userService.createUser(dto);
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  updateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const dto: UpdateUserDto = req.body;
      const result = await this.userService.updateUser(id, dto);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  changeRole = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const dto: ChangeRoleDto = req.body;
      const result = await this.userService.changeRole(id, dto, req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  deleteUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { reassignTo, deleteClients } = req.query;

      const options: { reassignTo?: string; deleteClients?: boolean } = {};
      if (reassignTo && typeof reassignTo === "string") {
        options.reassignTo = reassignTo;
      }
      if (deleteClients === "true") {
        options.deleteClients = true;
      }

      const result = await this.userService.deleteUser(
        id,
        req.user!.id,
        options
      );
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  setupAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const ADMIN_EMAIL = "pulidxx1@gmail.com";
      const { password } = req.body;

      if (!password || typeof password !== "string" || password.trim() === "") {
        res.status(400).json({
          error: {
            message: "La contraseña es requerida",
            code: "VALIDATION_ERROR",
            status: 400,
          },
        });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({
        where: { email: ADMIN_EMAIL },
      });

      if (existingUser) {
        await userRepository.remove(existingUser);
      }

      const hashedPassword = await hashPassword(password);

      const adminUser = userRepository.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      });

      await userRepository.save(adminUser);

      res.status(200).json({
        message: "Usuario admin configurado exitosamente",
        email: ADMIN_EMAIL,
        role: "admin",
        warning: "Cambia la contraseña después del primer login",
      });
    } catch (error) {
      handleError(error, res);
    }
  };
}
