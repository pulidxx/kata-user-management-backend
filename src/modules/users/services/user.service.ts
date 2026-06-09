import { User } from "../../../entities";
import { UserRepository } from "../repositories/user.repository";
import { ClientRepository } from "../../clients/repositories/client.repository";
import {
  CreateUserDto,
  UpdateUserDto,
  ChangeRoleDto,
  UserResponseDto,
  UsersListResponseDto,
} from "../dtos/user.dtos";
import { errors } from "../../../utils";
import { hashPassword } from "../../../utils/password.utils";

export class UserService {
  private userRepository: UserRepository;
  private clientRepository: ClientRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.clientRepository = new ClientRepository();
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  async getAllUsers(): Promise<UsersListResponseDto> {
    const users = await this.userRepository.findAll();
    return {
      users: users.map((user) => this.toUserResponse(user)),
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw errors.emailExists();
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    return this.toUserResponse(user);
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw errors.notFound("Usuario");
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw errors.emailExists();
      }
    }

    const updateData: Partial<User> = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.role) updateData.role = dto.role;

    if (dto.password && dto.password.trim() !== "") {
      updateData.password = await hashPassword(dto.password);
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw errors.notFound("Usuario");
    }

    return this.toUserResponse(updatedUser);
  }

  async changeRole(
    userId: string,
    dto: ChangeRoleDto,
    requestingUserId: string
  ): Promise<UserResponseDto> {
    if (userId === requestingUserId) {
      throw errors.validation("No puedes cambiar tu propio rol");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw errors.notFound("Usuario");
    }

    const updatedUser = await this.userRepository.update(userId, {
      role: dto.role,
    });
    if (!updatedUser) {
      throw errors.notFound("Usuario");
    }

    return this.toUserResponse(updatedUser);
  }

  async deleteUser(
    userId: string,
    requestingUserId: string,
    options?: { reassignTo?: string; deleteClients?: boolean }
  ): Promise<{
    message: string;
    id: string;
    reassignedCount?: number;
    deletedClientsCount?: number;
  }> {
    if (userId === requestingUserId) {
      throw errors.validation("No puedes eliminarte a ti mismo");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw errors.notFound("Usuario");
    }

    const clientCount = await this.clientRepository.countByOwnerId(userId);

    if (clientCount > 0) {
      if (!options?.reassignTo && !options?.deleteClients) {
        throw errors.validation(
          "El usuario tiene clientes asignados. Debe reasignarlos o eliminarlos."
        );
      }

      if (options.reassignTo) {
        const targetUser = await this.userRepository.findById(
          options.reassignTo
        );
        if (!targetUser) {
          throw errors.notFound("Usuario de reasignación");
        }

        if (targetUser.role === "consulta") {
          throw errors.validation(
            "No se puede reasignar a un usuario de consulta."
          );
        }

        const reassignedCount = await this.clientRepository.updateOwner(
          userId,
          options.reassignTo
        );

        const deleted = await this.userRepository.delete(userId);
        if (!deleted) {
          throw errors.notFound("Usuario");
        }

        return {
          message: "Usuario eliminado",
          id: userId,
          reassignedCount,
        };
      }

      if (options.deleteClients) {
        const deletedClientsCount =
          await this.clientRepository.softDeleteByOwnerId(userId);

        const deleted = await this.userRepository.delete(userId);
        if (!deleted) {
          throw errors.notFound("Usuario");
        }

        return {
          message: "Usuario y clientes eliminados",
          id: userId,
          deletedClientsCount,
        };
      }
    }

    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw errors.notFound("Usuario");
    }

    return {
      message: "Usuario eliminado",
      id: userId,
    };
  }
}
