import { prisma } from "@/lib/prisma";

export type CreateCashFlowData = {
  description: string;
  type: string;
  category?: string | null;
  value: number;
  dueDate?: Date | null;
  paidAt?: Date | null;
  status: string;
  notes?: string | null;
  companyId: string;
  financialId?: string | null;
};

export async function createCashFlowRepository(
  data: CreateCashFlowData
) {
  return prisma.cashFlow.create({
    data: {
      description: data.description,
      type: data.type,
      category: data.category ?? null,
      value: data.value,
      dueDate: data.dueDate ?? null,
      paidAt: data.paidAt ?? null,
      status: data.status,
      notes: data.notes ?? null,
      companyId: data.companyId,
      financialId: data.financialId ?? null,
    },
  });
}

export async function findCompanyCashFlow(
  companyId: string
) {
  return prisma.cashFlow.findMany({
    where: {
      companyId,
    },
    include: {
      financial: {
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        dueDate: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function findCashFlowById(
  id: string,
  companyId: string
) {
  return prisma.cashFlow.findFirst({
    where: {
      id,
      companyId,
    },
  });
}

export async function updateCashFlowRepository(
  id: string,
  companyId: string,
  data: {
    description: string;
    type: string;
    category: string | null;
    value: number;
    dueDate: Date | null;
    paidAt: Date | null;
    status: string;
    notes: string | null;
    financialId: string | null;
  }
) {
  return prisma.cashFlow.update({
    where: {
      id,
      companyId,
    },
    data,
  });
}

export async function deleteCashFlowRepository(
  id: string,
  companyId: string
) {
  return prisma.cashFlow.delete({
    where: {
      id,
      companyId,
    },
  });
}

export async function getCashFlowSummary(
  companyId: string
) {
  const [entries, expenses] = await Promise.all([
    prisma.cashFlow.aggregate({
      where: {
        companyId,
        type: "ENTRADA",
        status: "PAGO",
      },
      _sum: {
        value: true,
      },
    }),

    prisma.cashFlow.aggregate({
      where: {
        companyId,
        type: "SAIDA",
        status: "PAGO",
      },
      _sum: {
        value: true,
      },
    }),
  ]);

  return {
    entries: entries._sum.value ?? 0,
    expenses: expenses._sum.value ?? 0,
  };
}