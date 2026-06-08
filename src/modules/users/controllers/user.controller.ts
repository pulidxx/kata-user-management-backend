import { Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto, UpdateUserDto, ChangeRoleDto } from "../dtos/user.dtos";
import { AuthenticatedRequest } from "../../../types";
import { handleError } from "../../../utils";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response,
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
    res: Response,
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
    res: Response,
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
    res: Response,
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
    res: Response,
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
        options,
      );
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };
}
