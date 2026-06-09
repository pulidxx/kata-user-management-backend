import bcrypt from "bcryptjs";
import { comparePassword, hashPassword } from "../../src/utils/password.utils";

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

describe("password.utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hashPassword usa bcrypt con 10 salt rounds", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-value");

    await expect(hashPassword("secret")).resolves.toBe("hashed-value");
    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
  });

  it("comparePassword delega en bcrypt.compare", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(comparePassword("secret", "hashed")).resolves.toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("secret", "hashed");
  });
});
