import { Request } from "express";
import { User, UserRole } from "../entities";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface ClientFilters {
  status?: string;
  search?: string;
}
