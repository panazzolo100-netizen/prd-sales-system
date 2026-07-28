"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Trash2, X } from "lucide-react";
import { OPPORTUNITY_SERVICE_TYPES, inferLegacyServiceType, serviceTypeConfig, serviceTypeLabel, type OpportunityServiceType, type ServiceField } from "@/lib/opportunity-service-types";

import { LeadStageBar } from "@/components/leads/LeadStageBar";
import { PipelineInternalNotes } from "@/components/leads/PipelineInternalNotes";
import {
  LeadTabs,
  type LeadTab,
} from "@/components/leads/LeadTabs";
import { Drawer } from "@/components/ui/Drawer";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import type { LeadListItem } from "@/types/lead";

type Props = {
  lead: LeadListItem | null;
  open: boolean;
  initialTab?: LeadTab;
  hiddenTabs?: LeadTab[];
  showInternalNotes?: boolean;
  showActivityAuthors?: boolean;
  canArchive?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onArchived?: (leadId: string) => void;
  onDeleted?: (leadId: string) => void;
  onLeadChange?: (lead: LeadListItem) => void;

  onStatusChange?: (
    leadId: string,
    status: LeadStatus
  ) => void;
};

function formatEstimatedValue(
  value: number | null
) {
  if (!value || !Number.isFinite(value)) {
    return "Valor não informado";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function getStatusLabel(
  status: LeadStatus
) {
  switch (status) {
    case LeadStatus.NOVO:
      return "Novo";

    case LeadStatus.CONTATO:
      return "Contato";

    case LeadStatus.VISITA:
      return "Visita";

    case LeadStatus.PROPOSTA:
      return "Proposta";

    case LeadStatus.NEGOCIACAO:
      return "Negociação";

    case LeadStatus.GANHO:
      return "Ganho";

    case LeadStatus.PERDIDO:
      return "Perdido";

    default:
      return status;
  }
}

export function LeadDetailsDrawer({
  lead,
  open,
  initialTab = "Resumo",
  hiddenTabs,
  showInternalNotes = false,
  showActivityAuthors = false,
  canArchive = false,
  canDelete = false,
  onClose,
  onArchived,
  onDeleted,
  onLeadChange,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [
    currentStatus,
    setCurrentStatus,
  ] =
    useState<LeadStatus | null>(
      lead?.status ?? null
    );

  useEffect(() => {
    if (lead) {
      setCurrentStatus(
        lead.status
      );
    }
  }, [lead]);

  if (!lead || !currentStatus) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Oportunidade comercial"
      title={lead.companyName}
      description={lead.contactName}
      maxWidthClassName="max-w-5xl"
    >
      <LeadStageBar
        leadId={lead.id}
        currentStatus={currentStatus}
        onStatusChange={(status) => {
          setCurrentStatus(status);

          onStatusChange?.(
            lead.id,
            status
          );

          router.refresh();
        }}
      />

      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-white/[0.07] px-8 py-4">
        {archiveError && <p className="mr-auto text-sm font-medium text-red-400">{archiveError}</p>}
        <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white/5"><Pencil size={16}/>Editar oportunidade</button>
        {canArchive && (
          <button
            type="button"
            onClick={() => {
              setArchiveError(null);
              setArchiveOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-600 transition hover:bg-amber-500/20 dark:text-amber-300"
          >
            <Archive size={16} /> Arquivar oportunidade
          </button>
        )}
      </div>

      <section className="grid gap-4 border-b border-white/[0.07] px-8 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <LeadSummaryCard
          label="Status"
          value={getStatusLabel(
            currentStatus
          )}
          highlight
        />

        <LeadSummaryCard
          label="Telefone"
          value={lead.phone ?? "-"}
        />

        <LeadSummaryCard
          label="Cidade"
          value={
            lead.city
              ? `${lead.city}${
                  lead.state
                    ? ` - ${lead.state}`
                    : ""
                }`
              : "-"
          }
        />

        <LeadSummaryCard
          label="Valor estimado"
          value={formatEstimatedValue(
            lead.estimatedValue
          )}
          highlight
        />
      </section>

      {showInternalNotes && (
        <PipelineInternalNotes
          leadId={lead.id}
          initialValue={lead.notes}
          onSaved={(updatedLead) =>
            onLeadChange?.({ ...lead, ...updatedLead })
          }
        />
      )}

      <LeadTabs
        lead={{
          ...lead,
          status: currentStatus,
        }}
        initialTab={initialTab}
        hiddenTabs={hiddenTabs}
        showActivityAuthors={showActivityAuthors}
        onLeadChange={onLeadChange}
      />
      {canDelete && (
        <section className="mx-8 mb-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            Zona de risco
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Esta ação não poderá ser desfeita. O cadastro geral do cliente não será apagado.
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmation("");
                setDeleteError(null);
                setDeleteOpen(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/20 dark:text-red-300"
            >
              <Trash2 size={16} />
              Excluir oportunidade
            </button>
          </div>
        </section>
      )}
      {archiveOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="archive-opportunity-title" className="w-full max-w-lg rounded-2xl border border-amber-500/20 bg-white p-6 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">Arquivamento</p>
                <h2 id="archive-opportunity-title" className="mt-2 text-xl font-bold text-zinc-950 dark:text-zinc-100">
                  Arquivar {lead.companyName}?
                </h2>
              </div>
              <button type="button" aria-label="Fechar" disabled={archiving} onClick={() => setArchiveOpen(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Esta ação removerá a oportunidade do Pipeline ativo, mas manterá todos os dados, arquivos e históricos salvos.
            </p>
            {archiveError && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300">{archiveError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={archiving} onClick={() => setArchiveOpen(false)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5">
                Cancelar
              </button>
              <button
                type="button"
                disabled={archiving}
                onClick={async () => {
                  setArchiving(true);
                  setArchiveError(null);
                  try {
                    const response = await fetch(`/api/leads/${lead.id}/archive`, { method: "PATCH" });
                    const payload = await response.json();
                    if (!response.ok) throw new Error(payload.error ?? "Não foi possível arquivar a oportunidade.");
                    setArchiveOpen(false);
                    onArchived?.(lead.id);
                    onClose();
                  } catch (error) {
                    setArchiveError(error instanceof Error ? error.message : "Não foi possível arquivar a oportunidade.");
                  } finally {
                    setArchiving(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Archive size={16} />
                {archiving ? "Arquivando..." : "Confirmar arquivamento"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteOpen && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-opportunity-title"
            className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-white p-6 shadow-2xl dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
                  Exclusão definitiva
                </p>
                <h2 id="delete-opportunity-title" className="mt-2 text-xl font-bold text-zinc-950 dark:text-zinc-100">
                  Excluir oportunidade?
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-xl border border-red-500/15 bg-red-500/[0.04] p-4 text-sm text-zinc-700 dark:text-zinc-300">
              <p><strong>Nome da oportunidade:</strong> {lead.companyName}</p>
              <p><strong>Empresa:</strong> {lead.companyName}</p>
              <p><strong>Cliente:</strong> {lead.contactName}</p>
              <p><strong>Valor estimado:</strong> {formatEstimatedValue(lead.estimatedValue)}</p>
              <div className="space-y-2 pt-2 leading-6">
                <p>Esta ação excluirá permanentemente esta oportunidade do Pipeline.</p>
                <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                  O cadastro do cliente NÃO será removido.
                </p>
                <p>Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Digite <strong>EXCLUIR</strong> para confirmar:
              </span>
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                disabled={deleting}
                autoComplete="off"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-red-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </label>

            {deleteError && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting || deleteConfirmation !== "EXCLUIR"}
                onClick={async () => {
                  if (deleting || deleteConfirmation !== "EXCLUIR") return;
                  setDeleting(true);
                  setDeleteError(null);
                  try {
                    const response = await fetch(`/api/leads/${lead.id}`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ confirmationText: deleteConfirmation }),
                    });
                    const payload = await response.json();
                    if (!response.ok) {
                      throw new Error(payload.error ?? "Não foi possível excluir a oportunidade.");
                    }
                    setDeleteOpen(false);
                    onDeleted?.(lead.id);
                    onClose();
                  } catch (error) {
                    setDeleteError(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível excluir a oportunidade."
                    );
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editing && <OpportunityEditModal lead={lead} onClose={()=>setEditing(false)} onSaved={(updatedLead)=>{setEditing(false);onLeadChange?.({...lead,...updatedLead});if(!onLeadChange)router.refresh();}} />}
    </Drawer>
  );
}

type LeadSummaryCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function LeadSummaryCard({
  label,
  value,
  highlight = false,
}: LeadSummaryCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        highlight
          ? "border-orange-500/15 bg-orange-500/[0.05]"
          : "border-white/[0.06] bg-zinc-900/70"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 truncate font-black ${
          highlight
            ? "text-xl text-orange-400"
            : "text-lg text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const editControl="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500";
function EditField({field,value}:{field:ServiceField;value:unknown}){if(field.type==="boolean")return <label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300"><input name={`detail.${field.key}`} type="checkbox" defaultChecked={value===true}/>{field.label}</label>;if(field.type==="textarea")return <label className="space-y-2 sm:col-span-2"><span className="text-sm text-zinc-400">{field.label}</span><textarea name={`detail.${field.key}`} defaultValue={String(value??"")} rows={3} className={editControl}/></label>;if(field.type==="select")return <label className="space-y-2"><span className="text-sm text-zinc-400">{field.label}</span><select name={`detail.${field.key}`} defaultValue={String(value??"")} className={editControl}><option value="">Selecione</option>{field.options?.map(x=><option key={x}>{x}</option>)}</select></label>;return <label className="space-y-2"><span className="text-sm text-zinc-400">{field.label}</span><input name={`detail.${field.key}`} type={field.type==="number"?"number":"text"} defaultValue={String(value??"")} className={editControl}/></label>}
function OpportunityEditModal({lead,onClose,onSaved}:{lead:LeadListItem;onClose():void;onSaved(lead:LeadListItem):void}){const original=inferLegacyServiceType(lead);const [type,setType]=useState<OpportunityServiceType>(original??"USINA_SOLAR");const [saving,setSaving]=useState(false);const [error,setError]=useState<string|null>(null);async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(original&&original!==type&&!window.confirm("Alterar o tipo limpará apenas os campos específicos incompatíveis. Deseja continuar?"))return;setSaving(true);setError(null);const formElement=event.currentTarget;const form=new FormData(formElement);const estimatedValueInput=formElement.elements.namedItem("estimatedValue");const estimatedValue=estimatedValueInput instanceof HTMLInputElement&&estimatedValueInput.value!==""?estimatedValueInput.valueAsNumber:null;if(estimatedValue!==null&&!Number.isFinite(estimatedValue)){setError("Informe um valor estimado válido.");setSaving(false);return;}const details:Record<string,string|number|boolean>={};for(const field of serviceTypeConfig[type].fields){const raw=form.get(`detail.${field.key}`);if(field.type==="boolean")details[field.key]=raw==="on";else if(raw!==null&&String(raw).trim())details[field.key]=field.type==="number"?Number(raw):String(raw);}try{const response=await fetch("/api/leads",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:lead.id,companyName:form.get("companyName"),contactName:form.get("contactName"),phone:form.get("phone"),email:form.get("email"),city:form.get("city"),state:form.get("state"),source:form.get("source"),estimatedValue,notes:form.get("notes"),serviceType:type,serviceDetails:details,distributor:serviceTypeConfig[type].solar?details.distributor:null,consumerUnit:serviceTypeConfig[type].solar?details.consumerUnit:null,consumptionKwh:serviceTypeConfig[type].solar?Number(details.monthlyConsumption||0):null,demandKw:serviceTypeConfig[type].solar?Number(details.demand||0):null,expectedSaving:serviceTypeConfig[type].solar?Number(details.targetSaving||0):null})});const payload=await response.json();if(!response.ok)throw new Error(payload.error??"Erro ao salvar.");onSaved(payload as LeadListItem);}catch(err){setError(err instanceof Error?err.message:"Erro ao salvar.");}finally{setSaving(false);}}
return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"><header className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-orange-400">Editar oportunidade</p><h2 className="mt-1 text-2xl font-bold text-white">{lead.companyName}</h2></div><button type="button" onClick={onClose}><X className="text-zinc-400"/></button></header><div className="mt-6 grid gap-4 sm:grid-cols-2"><input name="companyName" defaultValue={lead.companyName} required className={editControl}/><input name="contactName" defaultValue={lead.contactName} required className={editControl}/><input name="phone" defaultValue={lead.phone??""} placeholder="Telefone" className={editControl}/><input name="email" defaultValue={lead.email??""} placeholder="E-mail" className={editControl}/><input name="city" defaultValue={lead.city??""} placeholder="Cidade" className={editControl}/><input name="state" defaultValue={lead.state??""} placeholder="UF" className={editControl}/><input name="estimatedValue" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={lead.estimatedValue??""} placeholder="Valor estimado" className={editControl}/><input name="source" defaultValue={lead.source??""} placeholder="Origem" className={editControl}/><textarea name="notes" defaultValue={lead.notes??""} placeholder="Observações" className={`${editControl} sm:col-span-2`}/><label className="space-y-2 sm:col-span-2"><span className="text-sm text-zinc-400">Tipo de serviço</span><select value={type} onChange={e=>setType(e.target.value as OpportunityServiceType)} className={editControl}>{OPPORTUNITY_SERVICE_TYPES.map(x=><option key={x} value={x}>{serviceTypeLabel(x)}</option>)}</select></label></div><h3 className="mb-4 mt-7 text-sm font-bold text-white">Especificações de {serviceTypeLabel(type)}</h3><div className="grid gap-4 sm:grid-cols-2">{serviceTypeConfig[type].fields.map(field=><EditField key={field.key} field={field} value={original===type?lead.serviceDetails?.[field.key]:undefined}/>)}</div>{error&&<p className="mt-4 text-sm text-red-400">{error}</p>}<footer className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300">Cancelar</button><button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Salvando...":"Salvar alterações"}</button></footer></form></div>}
