import { z } from "zod";
import { DocumentType, ClientStatus } from "../../../entities";

const documentTypes: [DocumentType, ...DocumentType[]] = [
  "CC",
  "CE",
  "TI",
  "PAS",
  "NIT",
];

const clientStatuses: [ClientStatus, ...ClientStatus[]] = [
  "Contactado",
  "En Validación",
  "Activo",
  "Inactivo",
  "Rechazado",
];

const isNotFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
};

export const createClientSchema = z.object({
  fullName: z
    .string({ error: "El nombre es obligatorio" })
    .min(1, "El nombre es obligatorio"),
  documentType: z.enum(documentTypes, {
    error: "Tipo de documento inválido",
  }),
  documentNumber: z
    .string({ error: "El documento es obligatorio" })
    .regex(/^[0-9]+$/, "Solo se permiten números"),
  email: z
    .string({ error: "El correo es obligatorio" })
    .email("Correo inválido"),
  phone: z
    .string({ error: "El teléfono es obligatorio" })
    .min(10, "Mínimo 10 caracteres"),
  city: z
    .string({ error: "La ciudad es obligatoria" })
    .min(1, "La ciudad es obligatoria"),
  address: z
    .string({ error: "La dirección es obligatoria" })
    .min(1, "La dirección es obligatoria"),
  birthDate: z
    .string({ error: "La fecha de nacimiento es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine(isNotFutureDate, {
      message: "La fecha no puede ser futura",
    }),
  status: z.enum(clientStatuses, {
    error: "Estado inválido",
  }),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;

export const updateClientSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio").optional(),
  documentType: z.enum(documentTypes).optional(),
  documentNumber: z
    .string()
    .regex(/^[0-9]+$/, "Solo se permiten números")
    .optional(),
  email: z.string().email("Correo inválido").optional(),
  phone: z.string().min(10, "Mínimo 10 caracteres").optional(),
  city: z.string().min(1, "La ciudad es obligatoria").optional(),
  address: z.string().min(1, "La dirección es obligatoria").optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine(isNotFutureDate, {
      message: "La fecha no puede ser futura",
    })
    .optional(),
  status: z.enum(clientStatuses).optional(),
});

export type UpdateClientDto = z.infer<typeof updateClientSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(clientStatuses, {
    error: "Estado inválido",
  }),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

export interface ClientResponseDto {
  id: string;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  birthDate: string;
  status: ClientStatus;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsListResponseDto {
  clients: ClientResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export const clientQuerySchema = z.object({
  status: z.enum(clientStatuses).optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

export type ClientQueryDto = z.infer<typeof clientQuerySchema>;
