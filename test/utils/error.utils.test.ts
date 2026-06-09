import { QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';
import { z } from 'zod';
import {
  AppError,
  createErrorResponse,
  errors,
  handleError,
} from '../../src/utils/error.utils';
import { buildMockResponse } from '../test-helpers';

describe('error.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createErrorResponse construye la estructura estándar', () => {
    expect(createErrorResponse('Mensaje', 'CODE', 400, { field: 'invalid' })).toEqual({
      error: {
        message: 'Mensaje',
        code: 'CODE',
        status: 400,
        details: { field: 'invalid' },
      },
    });
  });

  it('errors.notFound crea un AppError consistente', () => {
    const error = errors.notFound('Usuario');

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Usuario no encontrado');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });

  it('handleError responde AppError con status y payload', () => {
    const res = buildMockResponse();
    const error = new AppError('Sin permisos', 'FORBIDDEN', 403);

    handleError(error, res as never);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Sin permisos',
        code: 'FORBIDDEN',
        status: 403,
        details: undefined,
      },
    });
  });

  it('handleError transforma ZodError en respuesta de validación', () => {
    const res = buildMockResponse();

    let error: ZodError;
    try {
      z.object({ email: z.string() }).parse({});
      throw new Error('No se esperaba que la validación fuera exitosa');
    } catch (caughtError) {
      error = caughtError as ZodError;
    }

    handleError(error!, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Invalid input: expected string, received undefined',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: { email: 'Invalid input: expected string, received undefined' },
      },
    });
  });

  it('handleError reconoce conflictos únicos de base de datos', () => {
    const res = buildMockResponse();
    const error = new QueryFailedError('SELECT 1', [], {
      code: '23505',
      constraint: 'UQ_users_email',
      detail: 'Key (email) already exists.',
    } as never);

    handleError(error, res as never);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});