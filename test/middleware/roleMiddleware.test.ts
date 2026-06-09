import {
  requireAdmin,
  requireAdminOrAsesor,
  requireRole,
} from "../../src/middleware/roleMiddleware";
import { buildMockNext, buildMockResponse, sampleUser } from "../test-helpers";

describe("roleMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requireRole permite continuar cuando el rol coincide", () => {
    const next = buildMockNext();
    const req = { user: sampleUser({ role: "admin" }) };
    const res = buildMockResponse();

    requireRole("admin")(req as never, res as never, next as never);

    expect(next).toHaveBeenCalled();
  });

  it("requireAdminOrAsesor bloquea roles no permitidos", () => {
    const next = buildMockNext();
    const req = { user: sampleUser({ role: "consulta" }) };
    const res = buildMockResponse();

    requireAdminOrAsesor(req as never, res as never, next as never);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAdmin rechaza cuando no hay usuario autenticado", () => {
    const next = buildMockNext();
    const req = {};
    const res = buildMockResponse();

    requireAdmin(req as never, res as never, next as never);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
