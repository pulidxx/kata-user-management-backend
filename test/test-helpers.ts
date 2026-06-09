import { Response } from "express";
import { Client, User } from "../src/entities";

export const buildMockResponse = () => {
  const res = {} as Partial<Response> & {
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
    setHeader: jest.Mock;
  };

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);

  return res;
};

export const buildMockNext = () => jest.fn();

export const makeDate = (value: string) => new Date(value);

export const sampleUser = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "user-1",
    name: "Usuario Prueba",
    email: "user@test.com",
    password: "hashed-password",
    role: "asesor" as const,
    createdAt: makeDate("2026-01-01T00:00:00.000Z"),
    updatedAt: makeDate("2026-01-02T00:00:00.000Z"),
    clients: [],
    refreshTokens: [],
    ...overrides,
  }) as User;

export const sampleClient = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "client-1",
    fullName: "Cliente Prueba",
    documentType: "CC",
    documentNumber: "100200300",
    email: "client@test.com",
    phone: "3001234567",
    city: "Bogotá",
    address: "Calle 123 #45-67",
    birthDate: "1990-01-01",
    status: "Contactado",
    ownerId: "user-1",
    createdAt: makeDate("2026-01-01T10:00:00.000Z"),
    updatedAt: makeDate("2026-01-02T10:00:00.000Z"),
    ...overrides,
  }) as Client;
