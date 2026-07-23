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

export async function receiveFinancialInstallmentTransaction(data: { financialId: string; installmentId: string; companyId: string }) {
  return prisma.$transaction(async (transaction) => {
    const financial = await transaction.financial.findFirst({
      where: { id: data.financialId, companyId: data.companyId },
      include: { project: { include: { client: true } }, installments: true },
    });
    if (!financial) throw new Error("Financeiro não encontrado.");
    const installment = financial.installments.find((item) => item.id === data.installmentId);
    if (!installment) throw new Error("Parcela não encontrada neste financeiro.");
    if (installment.status === "PAGO") throw new Error("Esta parcela já foi recebida.");
    const alreadyReceived = financial.installments.filter((item) => item.status === "PAGO").reduce((total, item) => total + item.value, 0);
    const receivedValue = alreadyReceived + installment.value;
    if (financial.saleValue > 0 && receivedValue > financial.saleValue + 0.01) throw new Error("O recebimento excede o saldo pendente do projeto.");
    const paidAt = new Date();
    await transaction.financialInstallment.update({ where: { id: installment.id }, data: { paidAt, status: "PAGO" } });
    await transaction.cashFlow.create({ data: { description: `${installment.description ?? `Parcela ${installment.number}`} — ${financial.project.client.name}`, type: "ENTRADA", category: "RECEBIMENTO", value: installment.value, dueDate: installment.dueDate, paidAt, status: "PAGO", notes: `Recebimento do projeto ${financial.project.title}.`, companyId: data.companyId, financialId: financial.id } });
    const status = receivedValue >= financial.saleValue ? "RECEBIDO" : "PARCIAL";
    await transaction.financial.update({ where: { id: financial.id }, data: { receivedValue, status } });
    await transaction.projectTimeline.create({ data: { projectId: financial.projectId, type: "FINANCIAL_UPDATED", title: "Recebimento registrado", description: `${installment.description ?? `Parcela ${installment.number}`} foi recebida.` } });
    return { received: receivedValue, status };
  });
}

export async function findFinancialDeletionDependencies(
  id: string,
  companyId: string
) {
  return prisma.financial.findFirst({
    where: {
      id,
      companyId,
    },
    select: {
      id: true,
      status: true,
      receivedValue: true,
      installments: {
        select: {
          id: true,
          status: true,
          paidAt: true,
        },
      },
      cashFlow: {
        select: {
          id: true,
          status: true,
          paidAt: true,
        },
      },
      attachments: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function deleteFinancialRepository(
  id: string,
  companyId: string
) {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.financial.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        receivedValue: true,
        status: true,
        installments: {
          select: {
            status: true,
            paidAt: true,
          },
        },
        cashFlow: {
          select: {
            status: true,
            paidAt: true,
          },
        },
        _count: {
          select: {
            attachments: true,
          },
        },
      },
    });

    const consolidated =
      !current ||
      current.receivedValue > 0 ||
      ["PAGO", "RECEBIDO", "PARCIAL", "CONCILIADO"].includes(
        current.status.toUpperCase()
      ) ||
      current.installments.some(
        (item) =>
          item.paidAt ||
          item.status.toUpperCase() === "PAGO"
      ) ||
      current.cashFlow.some(
        (item) =>
          item.paidAt ||
          ["PAGO", "RECEBIDO", "CONCILIADO"].includes(
            item.status.toUpperCase()
          )
      );

    if (consolidated || current._count.attachments > 0) {
      return null;
    }

    await transaction.cashFlow.deleteMany({
      where: {
        financialId: id,
        companyId,
      },
    });
    await transaction.financialInstallment.deleteMany({
      where: {
        financialId: id,
      },
    });
    return transaction.financial.delete({
      where: {
        id,
        companyId,
      },
    });
  }, { isolationLevel: "Serializable" });
}
