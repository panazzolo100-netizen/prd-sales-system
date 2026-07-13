import { prisma } from "@/lib/prisma";

export async function createInstallments(
  data: {
    financialId: string;
    installments: {
      number: number;
      description?: string | null;
      value: number;
      dueDate: Date;
      status: string;
      notes?: string | null;
    }[];
  }
) {
  return prisma.financialInstallment.createMany({
    data: data.installments.map((item) => ({
      financialId: data.financialId,
      number: item.number,
      description: item.description ?? null,
      value: item.value,
      dueDate: item.dueDate,
      status: item.status,
      notes: item.notes ?? null,
    })),
  });
}

export async function listInstallments(
  financialId: string
) {
  return prisma.financialInstallment.findMany({
    where: {
      financialId,
    },
    orderBy: {
      number: "asc",
    },
  });
}

export async function updateInstallment(
  id: string,
  data: {
    paidAt: Date | null;
    status: string;
    notes: string | null;
  }
) {
  return prisma.financialInstallment.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteInstallments(
  financialId: string
) {
  return prisma.financialInstallment.deleteMany({
    where: {
      financialId,
    },
  });
}