import { Search } from "lucide-react";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";

type LeadsFiltersProps = {
  search: string;
  onSearchChange(value: string): void;

  status: string;
  onStatusChange(value: string): void;
};

export function LeadsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: LeadsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">

      <div className="relative flex-1">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Pesquisar empresa, cliente ou cidade..."
          className="w-full rounded-2xl border border-white/[0.06] bg-zinc-900 py-3 pl-11 pr-4 text-white outline-none transition focus:border-orange-500"
        />

      </div>

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
        className="rounded-2xl border border-white/[0.06] bg-zinc-900 px-5 text-white outline-none transition focus:border-orange-500"
      >
        <option value="">
          Todos os status
        </option>

        {PIPELINE_STAGES.map((stage) => (
          <option
            key={stage.status}
            value={stage.status}
          >
            {stage.label}
          </option>
        ))}

      </select>

    </div>
  );
}
