import { Card } from "@/components/ui/Card";
import { LeadStatus } from "@/lib/generated/prisma/enums";

type PipelineItem = {
  status: LeadStatus;
  total: number;
};

type PipelineOverviewProps = {
  pipeline: PipelineItem[];
};

const columns = [
  { status: LeadStatus.NOVO, label: "Novo" },
  { status: LeadStatus.CONTATO, label: "Contato" },
  { status: LeadStatus.PROPOSTA, label: "Proposta" },
  { status: LeadStatus.GANHO, label: "Ganho" },
  { status: LeadStatus.PERDIDO, label: "Perdido" },
];

export function PipelineOverview({ pipeline }: PipelineOverviewProps) {
  function getTotal(status: LeadStatus) {
    return pipeline.find((item) => item.status === status)?.total ?? 0;
  }

  return (
    <Card className="col-span-2 h-[420px]">
      <h2 className="mb-6 text-2xl font-bold">Pipeline Comercial</h2>

      <div className="grid grid-cols-5 gap-4">
        {columns.map((column) => (
          <div key={column.status} className="rounded-2xl bg-zinc-800 p-4">
            <p className="text-sm text-zinc-400">{column.label}</p>

            <h3 className="mt-3 text-3xl font-black text-orange-500">
              {getTotal(column.status)}
            </h3>
          </div>
        ))}
      </div>
    </Card>
  );
}