import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JwtPayload, TokenPair } from "../types";
import { UserRole } from "../entities";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

export const generateAccessToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (): { token: string; expiresAt: Date } => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return { token, expiresAt };
};

export const generateTokenPair = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): { accessToken: string; refreshToken: string; refreshTokenExpiry: Date } => {
  const accessToken = generateAccessToken(payload);
  const { token: refreshToken, expiresAt: refreshTokenExpiry } =
    generateRefreshToken();
  return { accessToken, refreshToken, refreshTokenExpiry };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
