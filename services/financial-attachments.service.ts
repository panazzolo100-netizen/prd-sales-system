import {
  createFinancialAttachment,
  deleteFinancialAttachment,
  findFinancialAttachmentById,
  findFinancialAttachments,
} from "@/repositories/financial-attachments.repository";

export async function listFinancialAttachments(
  financialId: string
) {
  return findFinancialAttachments(financialId);
}

export async function uploadFinancialAttachment(data: {
  financialId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: string;
}) {
  return createFinancialAttachment(data);
}

export async function removeFinancialAttachment(
  id: string
) {
  const attachment =
    await findFinancialAttachmentById(id);

  if (!attachment) {
    throw new Error(
      "Anexo não encontrado."
    );
  }

  await deleteFinancialAttachment(id);

  return attachment;
}