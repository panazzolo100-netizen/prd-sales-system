import {
  createLeadActivity,
  createLeadFile,
  findLeadById,
} from "@/repositories/leads.repository";

export async function uploadCompanyLeadFile({
  leadId,
  companyId,
  name,
  url,
  mimeType,
  size,
}: {
  leadId: string;
  companyId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}) {
  const lead = await findLeadById(leadId, companyId);

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  const file = await createLeadFile({
    leadId,
    name,
    url,
    mimeType,
    size,
  });

  await createLeadActivity({
    leadId,
    userId: lead.ownerId,
    type: "FILE_UPLOADED",
    title: "Arquivo enviado",
    notes: name,
  });

  return file;
}