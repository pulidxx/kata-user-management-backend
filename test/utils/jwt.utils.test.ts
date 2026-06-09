import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  getJwtSecret,
  verifyAccessToken,
} from '../../src/utils/jwt.utils';

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('jwt.utils', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it('getJwtSecret devuelve el secreto configurado', () => {
    expect(getJwtSecret()).toBe('test-jwt-secret');
  });

  it('generateAccessToken firma el payload con el secreto', () => {
    (jwt.sign as jest.Mock).mockReturnValue('access-token');

    expect(
      generateAccessToken({ userId: 'user-1', email: 'user@test.com', role: 'asesor' }),
    ).toBe('access-token');
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 'user-1', email: 'user@test.com', role: 'asesor' },
      'test-jwt-secret',
      { expiresIn: '15m' },
    );
  });

  it('generateRefreshToken crea un token y una expiración futura', () => {
    (uuidv4 as jest.Mock).mockReturnValue('refresh-token');

    const { token, expiresAt } = generateRefreshToken();

    expect(token).toBe('refresh-token');
    expect(expiresAt).toBeInstanceOf(Date);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('generateTokenPair combina access token y refresh token', () => {
    (jwt.sign as jest.Mock).mockReturnValue('access-token');
    (uuidv4 as jest.Mock).mockReturnValue('refresh-token');

    const tokenPair = generateTokenPair({
      userId: 'user-1',
      email: 'user@test.com',
      role: 'admin',
    });

    expect(tokenPair.accessToken).toBe('access-token');
    expect(tokenPair.refreshToken).toBe('refresh-token');
    expect(tokenPair.refreshTokenExpiry).toBeInstanceOf(Date);
  });

  it('verifyAccessToken devuelve el payload validado', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-1' });

    expect(verifyAccessToken('token')).toEqual({ userId: 'user-1' });
  });

  it('decodeToken devuelve null cuando jwt.decode falla', () => {
    (jwt.decode as jest.Mock).mockImplementation(() => {
      throw new Error('boom');
    });

    expect(decodeToken('token')).toBeNull();
  });
});