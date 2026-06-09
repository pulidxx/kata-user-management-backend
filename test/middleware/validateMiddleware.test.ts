import { z } from "zod";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../src/middleware/validateMiddleware";
import { buildMockNext, buildMockResponse } from "../test-helpers";

describe("validateMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("validateBody reemplaza el body con el schema parseado", () => {
    const schema = z.object({ name: z.string() });
    const next = buildMockNext();
    const req = { body: { name: "Juan" } };
    const res = buildMockResponse();

    validateBody(schema)(req as never, res as never, next as never);

    expect((req as { body: { name: string } }).body).toEqual({ name: "Juan" });
    expect(next).toHaveBeenCalled();
  });

  it("validateQuery maneja errores de validación", () => {
    const schema = z.object({ page: z.coerce.number().int() });
    const next = buildMockNext();
    const req = { query: { page: "abc" } };
    const res = buildMockResponse();

    validateQuery(schema)(req as never, res as never, next as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("validateParams parsea params correctamente", () => {
    const schema = z.object({ id: z.string().uuid() });
    const next = buildMockNext();
    const req = { params: { id: "550e8400-e29b-41d4-a716-446655440000" } };
    const res = buildMockResponse();

    validateParams(schema)(req as never, res as never, next as never);

    expect(next).toHaveBeenCalled();
  });
});
