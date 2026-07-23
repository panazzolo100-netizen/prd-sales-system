import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { getDreData } from "@/services/dre.service";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function DrePage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const companyId = await getCurrentCompanyId();
  const from = params.from ? new Date(`${params.from}T00:00:00`) : undefined;
  const to = params.to ? new Date(`${params.to}T23:59:59`) : undefined;
  const data = await getDreData(companyId, { from, to });

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

        <form className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-zinc-900 p-4 sm:flex-row sm:items-end">
          <label className="text-sm font-semibold text-zinc-400">De<input type="date" name="from" defaultValue={params.from} className="mt-2 block h-11 rounded-xl border border-white/10 bg-zinc-950 px-4 text-white" /></label>
          <label className="text-sm font-semibold text-zinc-400">Até<input type="date" name="to" defaultValue={params.to} className="mt-2 block h-11 rounded-xl border border-white/10 bg-zinc-950 px-4 text-white" /></label>
          <button className="h-11 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white">Aplicar período</button>
          <a href="/financeiro/dre" className="flex h-11 items-center px-3 text-sm font-bold text-zinc-500 hover:text-white">Limpar</a>
        </form>

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

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-bold text-white">Principais despesas</h2>{data.categories.length ? <div className="mt-5 space-y-3">{data.categories.slice(0, 5).map((item, index) => <div key={item.category} className="flex items-center justify-between rounded-xl bg-zinc-950 p-4"><div className="flex items-center gap-3"><span className="text-sm font-black text-zinc-600">{index + 1}</span><span className="font-semibold text-white">{item.category}</span></div><strong className="text-red-400">{formatCurrency(item.value)}</strong></div>)}</div> : <p className="mt-5 text-sm text-zinc-500">Registre saídas pagas para visualizar o ranking.</p>}</section>
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-bold text-white">Tendência mensal</h2>{data.monthly.length ? <div className="mt-5 space-y-4">{data.monthly.map((item) => { const max = Math.max(item.revenue, item.expenses, 1); return <div key={item.month}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-white">{item.month.split("-").reverse().join("/")}</span><span className="text-zinc-500">{formatCurrency(item.revenue - item.expenses)}</span></div><div className="space-y-1"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(3, item.revenue / max * 100)}%` }} /><div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.max(3, item.expenses / max * 100)}%` }} /></div></div>; })}</div> : <p className="mt-5 text-sm text-zinc-500">Ainda não há movimentações realizadas no período.</p>}</section>
        </div>

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
