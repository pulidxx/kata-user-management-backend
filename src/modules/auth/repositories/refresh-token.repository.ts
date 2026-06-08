import { Repository, LessThan } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { RefreshToken } from "../../../entities";

export class RefreshTokenRepository {
  private repository: Repository<RefreshToken>;

  constructor() {
    this.repository = AppDataSource.getRepository(RefreshToken);
  }

  async create(tokenData: Partial<RefreshToken>): Promise<RefreshToken> {
    const token = this.repository.create(tokenData);
    return this.repository.save(token);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { token, revoked: false },
      relations: ["user"],
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await this.repository.update({ token }, { revoked: true });
    return (result.affected ?? 0) > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.repository.update({ userId, revoked: false }, { revoked: true });
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }

  async isTokenValid(token: string): Promise<boolean> {
    const refreshToken = await this.repository.findOne({
      where: { token, revoked: false },
    });

    if (!refreshToken) return false;
    if (refreshToken.expiresAt < new Date()) return false;

    return true;
  }
}
