import { z } from "zod";
import { LeadStatus } from "@/lib/generated/prisma/enums";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().optional().nullable());

export const createLeadSchema = z.object({
  companyId: z.string().min(1, "Empresa obrigatória."),
  ownerId: optionalText,
  companyName: z.string().trim().min(2, "Nome da empresa obrigatório."),
  contactName: z.string().trim().min(2, "Nome do contato obrigatório."),
  phone: optionalText,
  email: optionalText,
  city: optionalText,
  state: optionalText,
  source: optionalText,
  status: z.nativeEnum(LeadStatus).optional(),
  distributor: optionalText,
  consumerUnit: optionalText,
  consumptionKwh: optionalNumber,
  demandKw: optionalNumber,
  estimatedValue: optionalNumber,
  expectedSaving: optionalNumber,
  notes: optionalText,
});

export const updateLeadSchema = createLeadSchema
  .omit({
    companyId: true,
  })
  .partial();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;