import { buildMockNext, buildMockResponse, sampleUser } from '../test-helpers';

const mockUserRepository = {
  findById: jest.fn(),
};

jest.mock('../../src/modules/users/repositories/user.repository', () => ({
  UserRepository: jest.fn(() => mockUserRepository),
}));

jest.mock('../../src/utils', () => {
  const actual = jest.requireActual('../../src/utils');

  return {
    ...actual,
    verifyAccessToken: jest.fn(),
  };
});

import { verifyAccessToken } from '../../src/utils';

const { authMiddleware } = require('../../src/middleware/authMiddleware') as {
  authMiddleware: typeof import('../../src/middleware/authMiddleware').authMiddleware;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('agrega el usuario al request cuando el token es válido', async () => {
    const next = buildMockNext();
    const res = buildMockResponse();
    const user = sampleUser();

    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: user.id });
    mockUserRepository.findById.mockResolvedValue(user);

    const req = {
      header: jest.fn().mockReturnValue('Bearer access-token'),
      user: undefined,
    } as any;

    await authMiddleware(req as never, res as never, next as never);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });

  it('rechaza cuando falta Authorization', async () => {
    const next = buildMockNext();
    const res = buildMockResponse();
    const req = {
      header: jest.fn().mockReturnValue(undefined),
      user: undefined,
    } as any;

    await authMiddleware(req as never, res as never, next as never);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});