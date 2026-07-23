import {
  serviceTypeConfig,
  type OpportunityServiceType,
  type ServiceField,
} from "@/lib/opportunity-service-types";

type Props = {
  serviceType: OpportunityServiceType;
  details: Record<string, string | number | boolean>;
};

function formatValue(field: ServiceField, value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") {
    const formatted = new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2,
    }).format(value);
    return field.unit ? `${formatted} ${field.unit}` : formatted;
  }
  return field.unit ? `${value} ${field.unit}` : value;
}

export function EngineeringTechnicalDetails({ serviceType, details }: Props) {
  const config = serviceTypeConfig[serviceType];
  const configuredFields = [...config.fields, ...config.engineeringFields];
  const fields = Array.from(
    new Map(configuredFields.map((field) => [field.key, field])).values()
  );
  const visibleFields = fields.filter((field) => {
    const value = details[field.key];
    return value !== undefined && value !== null && value !== "";
  });
  const notes = visibleFields.find((field) =>
    ["technicalNotes", "notes"].includes(field.key)
  );
  const cards = visibleFields.filter((field) => field !== notes);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold text-white">
        Especificações do Serviço — {config.label}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">{config.category}</p>

      {visibleFields.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center">
          <p className="font-semibold text-zinc-300">
            Nenhuma especificação técnica cadastrada.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            As informações preenchidas na oportunidade aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
          {cards.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <p className="text-sm text-zinc-500">{field.label}</p>
                  <p className="mt-2 whitespace-pre-wrap font-semibold text-zinc-100">
                    {formatValue(field, details[field.key])}
                  </p>
                </div>
              ))}
            </div>
          )}

          {notes && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">{notes.label}</p>
              <p className="mt-2 whitespace-pre-wrap text-zinc-200">
                {formatValue(notes, details[notes.key])}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
