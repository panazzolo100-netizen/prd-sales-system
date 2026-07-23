"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { LeadListItem } from "@/types/lead";

import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadsGrid } from "@/components/leads/LeadsGrid";
import { LeadsHeader } from "@/components/leads/LeadsHeader";
import { NewLeadDrawer } from "@/components/leads/NewLeadDrawer";

type LeadsClientProps = {
  leads: LeadListItem[];
};

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

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !normalizedSearch ||
        lead.companyName
          .toLowerCase()
          .includes(normalizedSearch) ||
        lead.contactName
          .toLowerCase()
          .includes(normalizedSearch) ||
        lead.city
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        lead.phone
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        !status || lead.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

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

  function handleLeadCreated() {
    setNewDrawerOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <NewLeadDrawer
        open={newDrawerOpen}
        onClose={() =>
          setNewDrawerOpen(false)
        }
        onCreated={handleLeadCreated}
      />

      <LeadDetailsDrawer
        lead={selectedLead}
        open={selectedLead !== null}
        onClose={() =>
          setSelectedLead(null)
        }
        onDeleted={() => router.refresh()}
      />

      <LeadsHeader
        totalLeads={leads.length}
        onNewLead={() =>
          setNewDrawerOpen(true)
        }
      />

      <LeadsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {loadingLead && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-400">
          Carregando oportunidade...
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Mostrando{" "}
          <strong className="text-white">
            {filteredLeads.length}
          </strong>{" "}
          de{" "}
          <strong className="text-white">
            {leads.length}
          </strong>{" "}
          oportunidade(s)
        </p>

        {(search || status) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
            }}
            className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <LeadsGrid
        leads={filteredLeads}
        onOpenLead={openLead}
      />
    </div>
  );
}
