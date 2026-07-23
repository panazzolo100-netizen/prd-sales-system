import {
  isSolarService,
  normalizeServiceType,
  serviceTypeConfig,
  type OpportunityServiceType,
} from "@/lib/opportunity-service-types";

type Scalar = string | number | boolean;

type LegacySolarDetails = {
  installedPower?: number | null;
  modules?: number | null;
  modulePower?: number | null;
  moduleBrand?: string | null;
  inverter?: string | null;
  systemType?: string | null;
  distributor?: string | null;
  consumerUnit?: string | null;
  voltage?: string | null;
  phase?: string | null;
  roofType?: string | null;
  roofArea?: number | null;
  notes?: string | null;
} | null;

export function resolveServiceType(data: {
  leadServiceType?: string | null;
  projectServiceType?: string | null;
}): OpportunityServiceType {
  return (
    normalizeServiceType(data.leadServiceType) ??
    normalizeServiceType(data.projectServiceType) ??
    "USINA_SOLAR"
  );
}

export function prepareServiceDetails(data: {
  serviceType: OpportunityServiceType;
  serviceDetails: unknown;
  legacyEngineering?: LegacySolarDetails;
}) {
  const source =
    data.serviceDetails &&
    typeof data.serviceDetails === "object" &&
    !Array.isArray(data.serviceDetails)
      ? (data.serviceDetails as Record<string, unknown>)
      : {};
  const details = Object.fromEntries(
    Object.entries(source).filter(
      ([, value]) => ["string", "number", "boolean"].includes(typeof value)
    )
  ) as Record<string, Scalar>;

  if (
    Object.keys(details).length === 0 &&
    isSolarService(data.serviceType) &&
    data.legacyEngineering
  ) {
    return Object.fromEntries(
      Object.entries({
        installedPower: data.legacyEngineering.installedPower,
        modules: data.legacyEngineering.modules,
        modulePower: data.legacyEngineering.modulePower,
        moduleBrand: data.legacyEngineering.moduleBrand,
        inverter: data.legacyEngineering.inverter,
        systemType: data.legacyEngineering.systemType,
        distributor: data.legacyEngineering.distributor,
        consumerUnit: data.legacyEngineering.consumerUnit,
        voltage: data.legacyEngineering.voltage,
        phase: data.legacyEngineering.phase,
        roofType: data.legacyEngineering.roofType,
        roofArea: data.legacyEngineering.roofArea,
        technicalNotes: data.legacyEngineering.notes,
      }).filter(([, value]) => value !== null && value !== undefined && value !== "")
    ) as Record<string, Scalar>;
  }

  return details;
}

export function prepareTechnicalDetailRows(
  serviceType: OpportunityServiceType,
  details: Record<string, Scalar>
) {
  const fields = [
    ...serviceTypeConfig[serviceType].fields,
    ...serviceTypeConfig[serviceType].engineeringFields,
  ];
  const uniqueFields = Array.from(
    new Map(fields.map((field) => [field.key, field])).values()
  );

  return uniqueFields.flatMap((field) => {
    const value = details[field.key];
    if (value === undefined || value === null || value === "") return [];
    const formatted =
      typeof value === "boolean"
        ? value ? "Sim" : "Não"
        : typeof value === "number"
          ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value)
          : value;
    return [{
      key: field.key,
      label: field.label,
      value: `${formatted}${field.unit ? ` ${field.unit}` : ""}`,
    }];
  });
}
