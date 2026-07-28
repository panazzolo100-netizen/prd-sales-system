"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadsGrid } from "@/components/leads/LeadsGrid";
import { LeadsHeader } from "@/components/leads/LeadsHeader";
import type { LeadListItem } from "@/types/lead";

const LeadDetailsDrawer = dynamic(() =>
  import("@/components/leads/LeadDetailsDrawer").then(
    (module) => module.LeadDetailsDrawer
  )
);

const NewLeadDrawer = dynamic(() =>
  import("@/components/leads/NewLeadDrawer").then(
    (module) => module.NewLeadDrawer
  )
);

type LeadsClientProps = {
  leads: LeadListItem[];
};

export function LeadsClient({ leads }: LeadsClientProps) {
  const router = useRouter();

  const [currentLeads, setCurrentLeads] =
    useState<LeadListItem[]>(leads);

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

    return currentLeads.filter((lead) => {
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
  }, [currentLeads, search, status]);

  useEffect(() => {
    setCurrentLeads(leads);
  }, [leads]);

  function handleLeadChange(
    updatedLead: LeadListItem
  ) {
    setSelectedLead(updatedLead);

    setCurrentLeads((current) =>
      current.map((lead) =>
        lead.id === updatedLead.id
          ? { ...lead, ...updatedLead }
          : lead
      )
    );
  }

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
        alert("Erro ao carregar oportunidade.");
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

  function clearFilters() {
    setSearch("");
    setStatus("");
  }

  return (
    <div className="space-y-6">
      {newDrawerOpen && (
        <NewLeadDrawer
          open={newDrawerOpen}
          onClose={() =>
            setNewDrawerOpen(false)
          }
          onCreated={handleLeadCreated}
        />
      )}

      {selectedLead && (
        <LeadDetailsDrawer
          lead={selectedLead}
          open={selectedLead !== null}
          onClose={() =>
            setSelectedLead(null)
          }
          onLeadChange={handleLeadChange}
        />
      )}

      <LeadsHeader
        totalLeads={currentLeads.length}
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
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-600 dark:text-orange-400">
          Carregando oportunidade...
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">
          Mostrando{" "}
          <strong className="text-[var(--foreground)]">
            {filteredLeads.length}
          </strong>{" "}
          de{" "}
          <strong className="text-[var(--foreground)]">
            {currentLeads.length}
          </strong>{" "}
          oportunidade(s)
        </p>

        {(search || status) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
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