import { UserService } from "../../../../src/modules/users/services/user.service";
import { errors } from "../../../../src/utils";
import { hashPassword } from "../../../../src/utils/password.utils";
import { sampleUser } from "../../../test-helpers";

const userRepositoryMock = {
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const clientRepositoryMock = {
  countByOwnerId: jest.fn(),
  updateOwner: jest.fn(),
  softDeleteByOwnerId: jest.fn(),
};

jest.mock("../../../../src/modules/users/repositories/user.repository", () => ({
  UserRepository: jest.fn(() => userRepositoryMock),
}));

jest.mock(
  "../../../../src/modules/clients/repositories/client.repository",
  () => ({
    ClientRepository: jest.fn(() => clientRepositoryMock),
  })
);

jest.mock("../../../../src/utils/password.utils", () => ({
  hashPassword: jest.fn(),
}));

describe("UserService", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllUsers devuelve usuarios transformados", async () => {
    userRepositoryMock.findAll.mockResolvedValue([
      sampleUser({ role: "admin" }),
    ]);

    const result = await service.getAllUsers();

    expect(result.users).toHaveLength(1);
    expect(result.users[0].email).toBe("user@test.com");
  });

  it("createUser valida email duplicado", async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(sampleUser());

    await expect(
      service.createUser({
        name: "Nuevo",
        email: "user@test.com",
        password: "secret",
        role: "asesor",
      })
    ).rejects.toEqual(errors.emailExists());
  });

  it("createUser hashea la contraseña y crea el usuario", async () => {
    const created = sampleUser({ email: "new@test.com", role: "admin" });

    userRepositoryMock.findByEmail.mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue("hashed-password");
    userRepositoryMock.create.mockResolvedValue(created);

    const result = await service.createUser({
      name: "Nuevo",
      email: "new@test.com",
      password: "secret",
      role: "admin",
    });

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      name: "Nuevo",
      email: "new@test.com",
      password: "hashed-password",
      role: "admin",
    });
    expect(result.role).toBe("admin");
  });

  it("updateUser hashea la nueva contraseña cuando viene informada", async () => {
    const current = sampleUser();
    const updated = sampleUser({ name: "Actualizado" });

    userRepositoryMock.findById.mockResolvedValue(current);
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue("new-hashed");
    userRepositoryMock.update.mockResolvedValue(updated);

    const result = await service.updateUser("user-1", {
      name: "Actualizado",
      password: "new-secret",
    });

    expect(hashPassword).toHaveBeenCalledWith("new-secret");
    expect(userRepositoryMock.update).toHaveBeenCalledWith("user-1", {
      name: "Actualizado",
      password: "new-hashed",
    });
    expect(result.name).toBe("Actualizado");
  });

  it("deleteUser permite reasignar clientes antes de eliminar", async () => {
    const targetUser = sampleUser({ id: "target-user" });

    userRepositoryMock.findById
      .mockResolvedValueOnce(sampleUser())
      .mockResolvedValueOnce(targetUser);
    clientRepositoryMock.countByOwnerId.mockResolvedValue(3);
    clientRepositoryMock.updateOwner.mockResolvedValue(3);
    userRepositoryMock.delete.mockResolvedValue(true);

    const result = await service.deleteUser("user-1", "requesting-user", {
      reassignTo: "target-user",
    });

    expect(clientRepositoryMock.updateOwner).toHaveBeenCalledWith(
      "user-1",
      "target-user"
    );
    expect(result.reassignedCount).toBe(3);
  });

  it("deleteUser no permite autoincrementar acciones sobre sí mismo", async () => {
    await expect(service.deleteUser("user-1", "user-1")).rejects.toEqual(
      errors.validation("No puedes eliminarte a ti mismo")
    );
  });
});
