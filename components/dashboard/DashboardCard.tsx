import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Props = {
  titulo: string;
  valor: string | number;
  cor?: string;
  crescimento?: string;
};

export function DashboardCard({
  titulo,
  valor,
  cor = "text-orange-500",
  crescimento,
}: Props) {
  return (
    <Card className="transition-all duration-300 hover:scale-[1.02] hover:border-orange-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            {titulo}
          </p>

          <h2 className={`mt-3 text-5xl font-black ${cor}`}>
            {valor}
          </h2>
        </div>

        {crescimento && (
          <Badge>
            {crescimento}
          </Badge>
        )}
      </div>
    </Card>
  );
}