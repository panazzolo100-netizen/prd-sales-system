import { findCompanyCashFlow } from "@/repositories/cash-flow.repository";

export async function getDreData(
  companyId: string
) {
  const movements =
    await findCompanyCashFlow(companyId);

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

  return {
    revenue,
    expenses,
    result,
    margin,
    categories,
  };
}