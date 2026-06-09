import { AuthController } from '../../../../src/modules/auth/controllers/auth.controller';
import { buildMockResponse, sampleUser } from '../../../test-helpers';

const authServiceMock = {
  register: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../../../../src/modules/auth/services/auth.service', () => ({
  AuthService: jest.fn(() => authServiceMock),
}));

describe('AuthController', () => {
  const controller = new AuthController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register responde 201 con el resultado del servicio', async () => {
    const res = buildMockResponse();
    authServiceMock.register.mockResolvedValue({ user: sampleUser() });

    await controller.register({ body: {} } as never, res as never);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user: sampleUser() });
  });

  it('me responde 401 cuando no hay usuario autenticado', async () => {
    const res = buildMockResponse();

    await controller.me({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});