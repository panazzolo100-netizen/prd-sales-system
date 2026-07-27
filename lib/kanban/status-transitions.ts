export type KanbanModule = "engineering" | "projects" | "service-orders" | "proposals";

const allowed: Record<KanbanModule, Record<string, readonly string[]>> = {
  engineering: {
    NOVO: ["EM_ANDAMENTO", "AGUARDANDO"],
    EM_ANDAMENTO: ["NOVO", "AGUARDANDO", "CONCLUIDO"],
    AGUARDANDO: ["NOVO", "EM_ANDAMENTO", "CONCLUIDO"],
    CONCLUIDO: ["EM_ANDAMENTO"],
    CANCELADO: ["NOVO"],
  },
  projects: {
    NOVO: ["EM_ANDAMENTO", "AGUARDANDO"],
    EM_ANDAMENTO: ["NOVO", "AGUARDANDO", "CONCLUIDO"],
    AGUARDANDO: ["NOVO", "EM_ANDAMENTO", "CONCLUIDO"],
    CONCLUIDO: ["EM_ANDAMENTO"],
    CANCELADO: ["NOVO"],
  },
  "service-orders": {
    ABERTA: ["AGENDADA", "EM_ANDAMENTO"],
    AGENDADA: ["ABERTA", "EM_ANDAMENTO"],
    EM_ANDAMENTO: ["AGENDADA", "AGUARDANDO_ASSINATURA", "CONCLUIDA"],
    AGUARDANDO_ASSINATURA: ["EM_ANDAMENTO", "CONCLUIDA"],
    CONCLUIDA: ["EM_ANDAMENTO"],
    CANCELADA: ["ABERTA"],
  },
  proposals: {
    RASCUNHO: ["ENVIADA", "CANCELADA"],
    ENVIADA: ["RASCUNHO", "EM_NEGOCIACAO", "APROVADA", "RECUSADA", "EXPIRADA", "CANCELADA"],
    EM_NEGOCIACAO: ["ENVIADA", "APROVADA", "RECUSADA", "EXPIRADA", "CANCELADA"],
    APROVADA: ["CONCLUIDA"],
    CONCLUIDA: [],
    RECUSADA: ["EM_NEGOCIACAO"],
    REJEITADA: ["EM_NEGOCIACAO"],
    EXPIRADA: ["RASCUNHO"],
    CANCELADA: ["RASCUNHO"],
  },
};

export function canTransitionStatus(module: KanbanModule, from: string, to: string) {
  return from === to || (allowed[module][from] ?? []).includes(to);
}

export function assertStatusTransition(module: KanbanModule, from: string, to: string) {
  if (!canTransitionStatus(module, from, to)) {
    throw new Error(`Transição de ${from} para ${to} não permitida.`);
  }
}
