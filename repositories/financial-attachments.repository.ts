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
  financialId: string
) {
  return prisma.financialAttachment.findMany({
    where: {
      financialId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findFinancialAttachmentById(
  id: string
) {
  return prisma.financialAttachment.findUnique({
    where: {
      id,
    },
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