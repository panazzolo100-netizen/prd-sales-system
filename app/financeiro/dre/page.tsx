import { AppLayout } from "@/components/layout/AppLayout";
import { getDreData } from "@/services/dre.service";

const COMPANY_ID = "default-company";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function DrePage() {
  const data = await getDreData(COMPANY_ID);

  return (
    <AppLayout>
      <main className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            DRE
          </h1>

          <p className="mt-2 text-zinc-400">
            Demonstrativo de resultados da PRD Engenharia.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card
            label="Receita realizada"
            value={formatCurrency(data.revenue)}
            valueClass="text-emerald-400"
          />

          <Card
            label="Despesas realizadas"
            value={formatCurrency(data.expenses)}
            valueClass="text-red-400"
          />

          <Card
            label="Resultado"
            value={formatCurrency(data.result)}
            valueClass={
              data.result >= 0
                ? "text-cyan-400"
                : "text-red-400"
            }
          />

          <Card
            label="Margem"
            value={`${data.margin}%`}
            valueClass={
              data.margin >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }
          />
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold text-white">
            Demonstrativo
          </h2>

          <div className="mt-6 space-y-4">
            <Row
              label="Receita operacional"
              value={formatCurrency(data.revenue)}
              valueClass="text-emerald-400"
            />

            <Row
              label="(-) Despesas operacionais"
              value={formatCurrency(data.expenses)}
              valueClass="text-red-400"
            />

            <div className="border-t border-zinc-800 pt-4">
              <Row
                label="Resultado líquido"
                value={formatCurrency(data.result)}
                valueClass={
                  data.result >= 0
                    ? "text-cyan-400"
                    : "text-red-400"
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold text-white">
            Despesas por categoria
          </h2>

          {data.categories.length > 0 ? (
            <div className="mt-6 space-y-4">
              {data.categories.map((item) => {
                const percentage =
                  data.expenses === 0
                    ? 0
                    : Math.round(
                        (item.value / data.expenses) * 100
                      );

                return (
                  <div
                    key={item.category}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          {item.category}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {percentage}% das despesas
                        </p>
                      </div>

                      <p className="font-bold text-red-400">
                        {formatCurrency(item.value)}
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-10 text-center">
              <p className="text-zinc-500">
                Nenhuma despesa paga registrada.
              </p>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}

function Card({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">
        {label}
      </p>

      <h2
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-300">
        {label}
      </span>

      <strong className={valueClass}>
        {value}
      </strong>
    </div>
  );
}