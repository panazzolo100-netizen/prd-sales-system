import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import {
  createAgendaEvent,
  deleteAgendaEvent,
  findAgendaEventById,
  findAgendaEvents,
  findCompanyAgendaClients,
  findCompanyAgendaLeads,
  findCompanyAgendaProjects,
  findCompanyAgendaServiceOrders,
  findCompanyAgendaUsers,
  updateAgendaEvent,
  type AgendaEventInput,
} from "@/repositories/agenda.repository";

const EVENT_TYPES = [
  "VISITA_TECNICA",
  "VISTORIA",
  "INSTALACAO",
  "MANUTENCAO",
  "REUNIAO",
  "HOMOLOGACAO",
  "ENTREGA",
  "OUTRO",
] as const;

const EVENT_STATUSES = [
  "AGENDADO",
  "EM_ANDAMENTO",
  "CONCLUIDO",
  "CANCELADO",
] as const;

const EVENT_COLORS = [
  "ORANGE",
  "BLUE",
  "GREEN",
  "RED",
  "PURPLE",
  "YELLOW",
  "ZINC",
] as const;

function nullableString(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text = String(value).trim();

  return text.length > 0
    ? text
    : null;
}

function requiredDate(
  value: unknown,
  label: string
) {
  const date = new Date(String(value ?? ""));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} inválida.`);
  }

  return date;
}

function normalizeAgendaEventInput(
  input: Record<string, unknown>
): AgendaEventInput {
  const title = String(
    input.title ?? ""
  ).trim();

  if (!title) {
    throw new Error(
      "Título do evento é obrigatório."
    );
  }

  const type = String(
    input.type ?? "OUTRO"
  )
    .trim()
    .toUpperCase();

  if (
    !EVENT_TYPES.includes(
      type as (typeof EVENT_TYPES)[number]
    )
  ) {
    throw new Error(
      "Tipo de evento inválido."
    );
  }

  const status = String(
    input.status ?? "AGENDADO"
  )
    .trim()
    .toUpperCase();

  if (
    !EVENT_STATUSES.includes(
      status as (typeof EVENT_STATUSES)[number]
    )
  ) {
    throw new Error(
      "Status do evento inválido."
    );
  }

  const color = String(
    input.color ?? "ORANGE"
  )
    .trim()
    .toUpperCase();

  if (
    !EVENT_COLORS.includes(
      color as (typeof EVENT_COLORS)[number]
    )
  ) {
    throw new Error(
      "Cor do evento inválida."
    );
  }

  const startAt = requiredDate(
    input.startAt,
    "Data inicial"
  );

  const endAt =
    input.endAt === null ||
    input.endAt === undefined ||
    input.endAt === ""
      ? null
      : requiredDate(
          input.endAt,
          "Data final"
        );

  if (
    endAt &&
    endAt.getTime() < startAt.getTime()
  ) {
    throw new Error(
      "O término não pode ser anterior ao início."
    );
  }

  return {
    title,
    type,
    status,
    color,
    allDay: Boolean(input.allDay),
    startAt,
    endAt,
    location: nullableString(
      input.location
    ),
    description: nullableString(
      input.description
    ),
    responsibleId: nullableString(
      input.responsibleId
    ),
    clientId: nullableString(
      input.clientId
    ),
    leadId: nullableString(
      input.leadId
    ),
    projectId: nullableString(
      input.projectId
    ),
    serviceOrderId: nullableString(
      input.serviceOrderId
    ),
  };
}

export async function getAgendaData() {
  const user = await requirePermission(
    PERMISSIONS.AGENDA
  );

  const [
    events,
    users,
    clients,
    leads,
    projects,
    serviceOrders,
  ] = await Promise.all([
    findAgendaEvents(user.companyId),
    findCompanyAgendaUsers(
      user.companyId
    ),
    findCompanyAgendaClients(
      user.companyId
    ),
    findCompanyAgendaLeads(
      user.companyId
    ),
    findCompanyAgendaProjects(
      user.companyId
    ),
    findCompanyAgendaServiceOrders(
      user.companyId
    ),
  ]);

  return {
    events,
    users,
    clients,
    leads,
    projects,
    serviceOrders,
  };
}

export async function createCompanyAgendaEvent(
  input: Record<string, unknown>
) {
  const user = await requirePermission(
    PERMISSIONS.AGENDA
  );

  return createAgendaEvent(
    user.companyId,
    user.id,
    normalizeAgendaEventInput(input)
  );
}

export async function updateCompanyAgendaEvent(
  id: string,
  input: Record<string, unknown>
) {
  const user = await requirePermission(
    PERMISSIONS.AGENDA
  );

  const existing =
    await findAgendaEventById(
      id,
      user.companyId
    );

  if (!existing) {
    throw new Error(
      "Evento não encontrado."
    );
  }

  const updated = await updateAgendaEvent(
    id,
    user.companyId,
    normalizeAgendaEventInput(input)
  );

  if (!updated) {
    throw new Error(
      "Evento não encontrado."
    );
  }

  return updated;
}

export async function deleteCompanyAgendaItem(
  id: string
) {
  const user = await requirePermission(
    PERMISSIONS.AGENDA
  );

  const deleted = await deleteAgendaEvent(
    id,
    user.companyId
  );

  if (!deleted) {
    throw new Error(
      "Evento não encontrado ou já excluído."
    );
  }

  return {
    success: true,
  };
}