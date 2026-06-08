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

export const createUserSchema = z.object({
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
  role: z.enum(["admin", "asesor", "consulta"], {
    error: "Rol inválido",
  }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres").optional(),
  email: z
    .string()
    .email("Formato de correo inválido")
    .transform((val) => val.toLowerCase())
    .optional(),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .refine((val) => passwordRegex.uppercase.test(val), {
      message: "Debe incluir una mayúscula",
    })
    .refine((val) => passwordRegex.number.test(val), {
      message: "Debe incluir un número",
    })
    .refine((val) => passwordRegex.special.test(val), {
      message: "Debe incluir un símbolo especial",
    })
    .optional(),
  role: z.enum(["admin", "asesor", "consulta"]).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const changeRoleSchema = z.object({
  role: z.enum(["admin", "asesor", "consulta"], {
    error: "Rol inválido",
  }),
});

export type ChangeRoleDto = z.infer<typeof changeRoleSchema>;

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "admin" | "asesor" | "consulta";
  createdAt: string;
  updatedAt?: string;
}

export interface UsersListResponseDto {
  users: UserResponseDto[];
}
