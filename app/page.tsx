import { AppLayout } from "../components/AppLayout";
import { StatsCard } from "../components/StatsCard";

export default function Home() {
  return (
    <AppLayout>
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="mt-2 text-zinc-400">
        Visão geral do sistema comercial da PRD.
      </p>

      <div className="mt-8 grid grid-cols-4 gap-5">
        <StatsCard title="Leads" value="28" />
        <StatsCard title="Clientes" value="14" />
        <StatsCard title="Propostas" value="9" />
        <StatsCard title="Vendas" value="R$ 320 mil" />
      </div>
    </AppLayout>
  );
}