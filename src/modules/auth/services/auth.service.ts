import { User } from "../../../entities";
import { UserRepository } from "../../users/repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
} from "../dtos/auth.dtos";
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  errors,
} from "../../../utils";

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
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

  async register(dto: RegisterDto): Promise<{ user: UserResponseDto }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw errors.emailExists();
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: "asesor",
    });

    return { user: this.toUserResponse(user) };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      throw errors.invalidCredentials();
    }

    const isValidPassword = await comparePassword(dto.password, user.password);
    if (!isValidPassword) {
      throw errors.invalidCredentials();
    }

    const { accessToken, refreshToken, refreshTokenExpiry } = generateTokenPair(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      }
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
    });

    return {
      user: this.toUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenRecord =
      await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenRecord) {
      throw errors.unauthorized();
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokenRepository.revokeToken(refreshToken);
      throw errors.unauthorized();
    }

    const user = tokenRecord.user;
    if (!user) {
      throw errors.unauthorized();
    }

    await this.refreshTokenRepository.revokeToken(refreshToken);

    const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiry,
    } = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshTokenExpiry,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw errors.notFound("Usuario");
    }
    return this.toUserResponse(user);
  }
}
