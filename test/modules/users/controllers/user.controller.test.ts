import { UserController } from "../../../../src/modules/users/controllers/user.controller";
import { buildMockResponse, sampleUser } from "../../../test-helpers";

const userServiceMock = {
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  changeRole: jest.fn(),
  deleteUser: jest.fn(),
};

jest.mock("../../../../src/modules/users/services/user.service", () => ({
  UserService: jest.fn(() => userServiceMock),
}));

describe("UserController", () => {
  const controller = new UserController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllUsers responde con la lista del servicio", async () => {
    const res = buildMockResponse();
    userServiceMock.getAllUsers.mockResolvedValue({ users: [sampleUser()] });

    await controller.getAllUsers({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ users: [sampleUser()] });
  });

  it("deleteUser usa el id autenticado como requestingUserId", async () => {
    const res = buildMockResponse();
    userServiceMock.deleteUser.mockResolvedValue({
      message: "Usuario eliminado",
      id: "user-1",
    });

    await controller.deleteUser(
      {
        params: { id: "user-1" },
        query: {},
        user: sampleUser({ id: "requesting-user" }),
      } as never,
      res as never
    );

    expect(userServiceMock.deleteUser).toHaveBeenCalledWith(
      "user-1",
      "requesting-user",
      {}
    );
  });
});
