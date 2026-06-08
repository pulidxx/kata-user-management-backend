import { z } from "zod";

const passwordRegex = {
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

const requiredString = (fieldName: string) =>
  z.string({
    error: (issue) =>
      issue.input === undefined
        ? `${fieldName} es requerido`
        : `${fieldName} debe ser texto`,
  });

export const registerSchema = z.object({
  name: requiredString("El nombre").min(3, "Mínimo 3 caracteres"),
  email: requiredString("El correo")
    .email("Formato de correo inválido")
    .transform((val) => val.toLowerCase()),
  password: requiredString("La contraseña")
    .min(8, "Mínimo 8 caracteres")
    .refine((val) => passwordRegex.uppercase.test(val), {
      message: "Debe incluir una mayúscula",
    })
    .refine((val) => passwordRegex.number.test(val), {
      message: "Debe incluir un número",
    })
    .refine((val) => passwordRegex.special.test(val), {
      message: "Debe incluir un símbolo especial",
    }),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: requiredString("El correo")
    .email("Formato de correo inválido")
    .transform((val) => val.toLowerCase()),
  password: requiredString("La contraseña"),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: requiredString("El refresh token"),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "admin" | "asesor" | "consulta";
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}
