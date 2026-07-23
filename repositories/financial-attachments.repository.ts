import { prisma } from "@/lib/prisma";

type CreateFinancialAttachmentData = {
  financialId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: string;
};

export async function createFinancialAttachment(
  data: CreateFinancialAttachmentData
) {
  return prisma.financialAttachment.create({
    data: {
      financialId: data.financialId,
      name: data.name,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      type: data.type,
    },
  });
}

export async function findFinancialAttachments(
  financialId: string,
  companyId: string
) {
  return prisma.financialAttachment.findMany({
    where: {
      financialId,
      financial: { companyId },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findFinancialAttachmentById(
  id: string,
  companyId: string
) {
  return prisma.financialAttachment.findFirst({
    where: { id, financial: { companyId } },
  });
}

export async function deleteFinancialAttachment(
  id: string
) {
  return prisma.financialAttachment.delete({
    where: {
      id,
    },
  });
}

export async function findCompanyFinancialForAttachment(financialId: string, companyId: string) {
  return prisma.financial.findFirst({ where: { id: financialId, companyId }, select: { id: true } });
}
