import { AuthService } from '../../../../src/modules/auth/services/auth.service';
import { errors } from '../../../../src/utils';
import { hashPassword, comparePassword } from '../../../../src/utils/password.utils';
import { generateTokenPair } from '../../../../src/utils/jwt.utils';
import { sampleUser } from '../../../test-helpers';

const userRepositoryMock = {
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

const refreshTokenRepositoryMock = {
  create: jest.fn(),
  findByToken: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
};

jest.mock('../../../../src/modules/users/repositories/user.repository', () => ({
  UserRepository: jest.fn(() => userRepositoryMock),
}));

jest.mock('../../../../src/modules/auth/repositories/refresh-token.repository', () => ({
  RefreshTokenRepository: jest.fn(() => refreshTokenRepositoryMock),
}));

jest.mock('../../../../src/utils/password.utils', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../../../src/utils/jwt.utils', () => ({
  generateTokenPair: jest.fn(),
}));

describe('AuthService', () => {
  const service = new AuthService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register crea un usuario asesor con email en minúsculas', async () => {
    const createdUser = sampleUser({ email: 'new@test.com', role: 'asesor' });

    userRepositoryMock.findByEmail.mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
    userRepositoryMock.create.mockResolvedValue(createdUser);

    const result = await service.register({
      name: 'Nuevo',
      email: 'NEW@TEST.COM',
      password: 'secret',
    });

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      name: 'Nuevo',
      email: 'new@test.com',
      password: 'hashed-password',
      role: 'asesor',
    });
    expect(result.user.email).toBe('new@test.com');
  });

  it('login genera tokens y guarda refresh token', async () => {
    const user = sampleUser({ password: 'stored-password' });

    userRepositoryMock.findByEmailWithPassword.mockResolvedValue(user);
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (generateTokenPair as jest.Mock).mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiry: new Date('2026-01-10T00:00:00.000Z'),
    });
    refreshTokenRepositoryMock.create.mockResolvedValue({});

    const result = await service.login({
      email: 'user@test.com',
      password: 'secret',
    });

    expect(result.accessToken).toBe('access-token');
    expect(refreshTokenRepositoryMock.create).toHaveBeenCalledWith({
      userId: user.id,
      token: 'refresh-token',
      expiresAt: new Date('2026-01-10T00:00:00.000Z'),
    });
  });

  it('refreshTokens revoca el token previo y crea uno nuevo', async () => {
    const user = sampleUser();

    refreshTokenRepositoryMock.findByToken.mockResolvedValue({
      expiresAt: new Date(Date.now() + 1000),
      user,
    });
    refreshTokenRepositoryMock.revokeToken.mockResolvedValue(true);
    (generateTokenPair as jest.Mock).mockReturnValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      refreshTokenExpiry: new Date('2026-01-11T00:00:00.000Z'),
    });

    const result = await service.refreshTokens('refresh-token');

    expect(refreshTokenRepositoryMock.revokeToken).toHaveBeenCalledWith('refresh-token');
    expect(refreshTokenRepositoryMock.create).toHaveBeenCalledWith({
      userId: user.id,
      token: 'new-refresh-token',
      expiresAt: new Date('2026-01-11T00:00:00.000Z'),
    });
    expect(result.accessToken).toBe('new-access-token');
  });

  it('logout revoca todos los tokens del usuario', async () => {
    await service.logout('user-1');

    expect(refreshTokenRepositoryMock.revokeAllUserTokens).toHaveBeenCalledWith('user-1');
  });

  it('getCurrentUser lanza notFound cuando el usuario no existe', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getCurrentUser('missing')).rejects.toEqual(errors.notFound('Usuario'));
  });
});