import { z } from "zod";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import { OPPORTUNITY_SERVICE_TYPES } from "@/lib/opportunity-service-types";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

const optionalNumber = z.preprocess((value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().optional().nullable());

export const createLeadSchema = z.object({
  ownerId: optionalText,

  companyName: z
    .string()
    .trim()
    .min(2, "Nome da empresa obrigatório."),

  contactName: z
    .string()
    .trim()
    .min(2, "Nome do contato obrigatório."),

  phone: optionalText,

  email: optionalText,

  city: optionalText,

  state: optionalText,

  source: optionalText,

  serviceType: z.enum(OPPORTUNITY_SERVICE_TYPES),
  serviceDetails: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().default({}),

  status: z
    .nativeEnum(LeadStatus)
    .optional(),

  distributor: optionalText,

  consumerUnit: optionalText,

  consumptionKwh: optionalNumber,

  demandKw: optionalNumber,

  estimatedValue: optionalNumber,

  expectedSaving: optionalNumber,

  notes: optionalText,
});

export const updateLeadSchema =
  createLeadSchema.partial();

export type CreateLeadInput = z.infer<
  typeof createLeadSchema
>;

export type UpdateLeadInput = z.infer<
  typeof updateLeadSchema
>;
