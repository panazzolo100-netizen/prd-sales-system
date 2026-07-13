"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bolt, MapPin, Phone, Plus, Search } from "lucide-react";
import type { LeadListItem } from "@/types/lead";
import { NewLeadDrawer } from "@/components/leads/NewLeadDrawer";
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";

type LeadsClientProps = {
  leads: LeadListItem[];
};

function formatCurrency(value: number | null) {
  if (!value) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatConsumption(value: number | null) {
  if (!value) return "Não informado";

  return `${value.toLocaleString("pt-BR")} kWh`;
}

function formatLocation(
  city: string | null,
  state: string | null
) {
  if (!city && !state) return "Local não informado";
  if (city && state) return `${city} - ${state}`;

  return city ?? state ?? "Local não informado";
}

export function LeadsClient({
  leads,
}: LeadsClientProps) {
  const router = useRouter();

  const [newDrawerOpen, setNewDrawerOpen] =
    useState(false);

  const [selectedLead, setSelectedLead] =
    useState<LeadListItem | null>(null);

  const [loadingLead, setLoadingLead] =
    useState(false);


  async function openLead(id: string) {
    setLoadingLead(true);

    try {
      const response = await fetch(
        `/api/leads/${id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        alert("Erro ao carregar lead.");
        return;
      }

      const lead = await response.json();

      setSelectedLead(lead);

    } finally {
      setLoadingLead(false);
    }
  }


  return (
    <div className="space-y-8">

      <NewLeadDrawer
        open={newDrawerOpen}
        onClose={() =>
          setNewDrawerOpen(false)
        }
        onCreated={() =>
          router.refresh()
        }
      />


      <LeadDetailsDrawer
        lead={selectedLead}
        open={selectedLead !== null}
        onClose={() =>
          setSelectedLead(null)
        }
      />


      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Oportunidades
          </h1>

          <p className="mt-2 text-zinc-400">
            Gerencie todo o funil comercial da PRD.
          </p>
        </div>


        <button
          onClick={() =>
            setNewDrawerOpen(true)
          }
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          <Plus size={18} />

          Novo Lead
        </button>

      </div>


      <div className="flex gap-4">

        <div className="flex flex-1 items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4">

          <Search
            size={18}
            className="text-zinc-500"
          />

          <input
            type="text"
            placeholder="Pesquisar empresa..."
            className="w-full bg-transparent p-3 text-white outline-none"
          />

        </div>


        <select className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white">

          <option>
            Todos
          </option>

          <option>
            Novo
          </option>

          <option>
            Contato
          </option>

          <option>
            Proposta
          </option>

          <option>
            Ganho
          </option>

          <option>
            Perdido
          </option>

        </select>

      </div>


      <div className="grid gap-5 xl:grid-cols-3">

        {leads.map((lead) => (

          <div
            key={lead.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-orange-500"
          >

            <div className="flex items-start justify-between">

              <h2 className="text-xl font-bold text-white">
                {lead.companyName}
              </h2>


              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                {lead.status}
              </span>

            </div>


            <p className="mt-2 text-zinc-400">
              {lead.contactName}
            </p>


            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3 text-zinc-300">
                <Phone size={16} />
                {lead.phone ?? "Sem telefone"}
              </div>


              <div className="flex items-center gap-3 text-zinc-300">
                <MapPin size={16} />
                {formatLocation(
                  lead.city,
                  lead.state
                )}
              </div>


              <div className="flex items-center gap-3 text-zinc-300">
                <Bolt size={16} />
                {formatConsumption(
                  lead.consumptionKwh
                )}
              </div>

            </div>


            <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-5">

              <div>

                <p className="text-sm text-zinc-500">
                  Valor estimado
                </p>


                <h3 className="text-2xl font-bold text-orange-500">

                  {formatCurrency(
                    lead.estimatedValue
                  )}

                </h3>

              </div>


              <button
                onClick={() =>
                  openLead(lead.id)
                }
                disabled={loadingLead}
                className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {loadingLead
                  ? "Abrindo..."
                  : "Abrir"}
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}