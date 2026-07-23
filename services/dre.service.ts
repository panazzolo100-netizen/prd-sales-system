import { findCompanyCashFlowByPeriod } from "@/repositories/cash-flow.repository";

export async function getDreData(
  companyId: string,
  period?: { from?: Date; to?: Date }
) {
  const movements =
    await findCompanyCashFlowByPeriod(companyId, period?.from, period?.to);

  const paidMovements = movements.filter(
    (item) => item.status === "PAGO"
  );

  const revenue = paidMovements
    .filter((item) => item.type === "ENTRADA")
    .reduce(
      (total, item) => total + item.value,
      0
    );

  const expenses = paidMovements
    .filter((item) => item.type === "SAIDA")
    .reduce(
      (total, item) => total + item.value,
      0
    );

  const result = revenue - expenses;

  const margin =
    revenue === 0
      ? 0
      : Math.round((result / revenue) * 100);

  const expensesByCategory = paidMovements
    .filter((item) => item.type === "SAIDA")
    .reduce<Record<string, number>>(
      (accumulator, item) => {
        const category =
          item.category?.trim() ||
          "Sem categoria";

        accumulator[category] =
          (accumulator[category] ?? 0) +
          item.value;

        return accumulator;
      },
      {}
    );

  const categories = Object.entries(
    expensesByCategory
  )
    .map(([category, value]) => ({
      category,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const monthly = paidMovements.reduce<Record<string, { revenue: number; expenses: number }>>((accumulator, item) => {
    const date = item.paidAt ?? item.createdAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    accumulator[key] ??= { revenue: 0, expenses: 0 };
    if (item.type === "ENTRADA") accumulator[key].revenue += item.value;
    else accumulator[key].expenses += item.value;
    return accumulator;
  }, {});

  return {
    revenue,
    expenses,
    result,
    margin,
    categories,
    monthly: Object.entries(monthly).map(([month, values]) => ({ month, ...values })).slice(-6),
  };
}
