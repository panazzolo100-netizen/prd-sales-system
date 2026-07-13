import { Card } from "@/components/ui/Card";

export function ActivityFeed() {
  const atividades = [
    "Nova oportunidade criada",
    "Cliente movido para Ganho",
    "Proposta em negociação",
    "Cliente convertido automaticamente",
  ];

  return (
    <Card className="h-[420px]">
      <h2 className="mb-6 text-2xl font-bold">Últimas Atividades</h2>

      <div className="space-y-4">
        {atividades.map((atividade, index) => (
          <div key={index} className="border-l-2 border-orange-500 pl-4">
            <p className="font-semibold">{atividade}</p>
            <p className="text-sm text-zinc-500">Agora há pouco</p>
          </div>
        ))}
      </div>
    </Card>
  );
}