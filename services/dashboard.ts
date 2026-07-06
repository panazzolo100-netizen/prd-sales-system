import { supabase } from "@/lib/supabase";

export async function getDashboardData() {
  const { data: leads } = await supabase.from("leads").select("*");
  const { data: clientes } = await supabase.from("clientes").select("*");

  const totalLeads = leads?.length || 0;
  const totalClientes = clientes?.length || 0;
  const ganhos = leads?.filter((lead) => lead.status === "Ganho").length || 0;
  const propostas = leads?.filter((lead) => lead.status === "Proposta").length || 0;

  const conversao =
    totalLeads > 0 ? Math.round((ganhos / totalLeads) * 100) : 0;

  return {
    totalLeads,
    totalClientes,
    ganhos,
    propostas,
    conversao,
  };
}