export type Lead = {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  origem?: string;
  status: "Novo" | "Contato" | "Proposta" | "Ganho" | "Perdido";
  observacoes?: string;
  created_at?: string;
};