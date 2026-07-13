import { prisma } from "@/lib/prisma";

export async function findCompanyFinancials(
  companyId: string
) {
  return prisma.financial.findMany({
    where: {
      companyId,
    },

   include: {
  project: {
    include: {
      client: true,
    },
  },

  installments: {
    orderBy: {
      number: "asc",
    },
  },

  attachments: {
    orderBy: {
      createdAt: "desc",
    },
  },

  cashFlow: {
    orderBy: {
      createdAt: "desc",
    },
  },
},

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findFinancialById(
  id: string,
  companyId: string
) {
  return prisma.financial.findFirst({
    where: {
      id,
      companyId,
    },

    include: {
      project: {
        include: {
          client: true,
        },
      },

      installments: {
        orderBy: {
          number: "asc",
        },
      },

      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}


export async function updateFinancialRepository(
  id: string,
  companyId: string,
  data: {
    saleValue: number;
    costValue: number;
    receivedValue: number;
    status: string;
    notes: string | null;
  }
) {
  return prisma.financial.update({
    where: {
      id,
      companyId,
    },

    data,
  });
}

export async function updateFinancialReceivedValue(
  id: string,
  receivedValue: number,
  status: string
) {
  return prisma.financial.update({
    where: {
      id,
    },

    data: {
      receivedValue,
      status,
    },
  });
}