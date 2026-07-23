"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { OPPORTUNITY_SERVICE_TYPES, inferLegacyServiceType, serviceTypeConfig, serviceTypeLabel, type OpportunityServiceType, type ServiceField } from "@/lib/opportunity-service-types";

import { LeadStageBar } from "@/components/leads/LeadStageBar";
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
  onClose: () => void;
  onDeleted?: (leadId: string) => void;

  onStatusChange?: (
    leadId: string,
    status: LeadStatus
  ) => void;
};

function formatCurrency(
  value: number | null
) {
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
  onClose,
  onDeleted,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
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
        {deleteError && <p className="mr-auto text-sm font-medium text-red-400">{deleteError}</p>}
        <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white/5"><Pencil size={16}/>Editar oportunidade</button>
        <button type="button" disabled={deleting} onClick={async () => {
          if (!window.confirm(`Excluir a oportunidade ${lead.companyName}? Esta ação não pode ser desfeita.`)) return;
          setDeleting(true); setDeleteError(null);
          try {
            const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error ?? "Não foi possível excluir a oportunidade.");
            onDeleted?.(lead.id); onClose(); router.refresh();
          } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Não foi possível excluir a oportunidade.");
          } finally { setDeleting(false); }
        }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50">
          <Trash2 size={16} /> {deleting ? "Excluindo..." : "Excluir oportunidade"}
        </button>
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
          value={formatCurrency(
            lead.estimatedValue
          )}
          highlight
        />
      </section>

      <LeadTabs
        lead={{
          ...lead,
          status: currentStatus,
        }}
        initialTab={initialTab}
      />
      {editing && <OpportunityEditModal lead={lead} onClose={()=>setEditing(false)} onSaved={()=>{setEditing(false);router.refresh();}} />}
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
function OpportunityEditModal({lead,onClose,onSaved}:{lead:LeadListItem;onClose():void;onSaved():void}){const original=inferLegacyServiceType(lead);const [type,setType]=useState<OpportunityServiceType>(original??"USINA_SOLAR");const [saving,setSaving]=useState(false);const [error,setError]=useState<string|null>(null);async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(original&&original!==type&&!window.confirm("Alterar o tipo limpará apenas os campos específicos incompatíveis. Deseja continuar?"))return;setSaving(true);setError(null);const form=new FormData(event.currentTarget);const details:Record<string,string|number|boolean>={};for(const field of serviceTypeConfig[type].fields){const raw=form.get(`detail.${field.key}`);if(field.type==="boolean")details[field.key]=raw==="on";else if(raw!==null&&String(raw).trim())details[field.key]=field.type==="number"?Number(raw):String(raw);}try{const response=await fetch("/api/leads",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:lead.id,companyName:form.get("companyName"),contactName:form.get("contactName"),phone:form.get("phone"),email:form.get("email"),city:form.get("city"),state:form.get("state"),source:form.get("source"),estimatedValue:Number(form.get("estimatedValue")||0),notes:form.get("notes"),serviceType:type,serviceDetails:details,distributor:serviceTypeConfig[type].solar?details.distributor:null,consumerUnit:serviceTypeConfig[type].solar?details.consumerUnit:null,consumptionKwh:serviceTypeConfig[type].solar?Number(details.monthlyConsumption||0):null,demandKw:serviceTypeConfig[type].solar?Number(details.demand||0):null,expectedSaving:serviceTypeConfig[type].solar?Number(details.targetSaving||0):null})});const payload=await response.json();if(!response.ok)throw new Error(payload.error??"Erro ao salvar.");onSaved();}catch(err){setError(err instanceof Error?err.message:"Erro ao salvar.");}finally{setSaving(false);}}
return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"><header className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-orange-400">Editar oportunidade</p><h2 className="mt-1 text-2xl font-bold text-white">{lead.companyName}</h2></div><button type="button" onClick={onClose}><X className="text-zinc-400"/></button></header><div className="mt-6 grid gap-4 sm:grid-cols-2"><input name="companyName" defaultValue={lead.companyName} required className={editControl}/><input name="contactName" defaultValue={lead.contactName} required className={editControl}/><input name="phone" defaultValue={lead.phone??""} placeholder="Telefone" className={editControl}/><input name="email" defaultValue={lead.email??""} placeholder="E-mail" className={editControl}/><input name="city" defaultValue={lead.city??""} placeholder="Cidade" className={editControl}/><input name="state" defaultValue={lead.state??""} placeholder="UF" className={editControl}/><input name="estimatedValue" type="number" defaultValue={lead.estimatedValue??""} placeholder="Valor estimado" className={editControl}/><input name="source" defaultValue={lead.source??""} placeholder="Origem" className={editControl}/><textarea name="notes" defaultValue={lead.notes??""} placeholder="Observações" className={`${editControl} sm:col-span-2`}/><label className="space-y-2 sm:col-span-2"><span className="text-sm text-zinc-400">Tipo de serviço</span><select value={type} onChange={e=>setType(e.target.value as OpportunityServiceType)} className={editControl}>{OPPORTUNITY_SERVICE_TYPES.map(x=><option key={x} value={x}>{serviceTypeLabel(x)}</option>)}</select></label></div><h3 className="mb-4 mt-7 text-sm font-bold text-white">Especificações de {serviceTypeLabel(type)}</h3><div className="grid gap-4 sm:grid-cols-2">{serviceTypeConfig[type].fields.map(field=><EditField key={field.key} field={field} value={original===type?lead.serviceDetails?.[field.key]:undefined}/>)}</div>{error&&<p className="mt-4 text-sm text-red-400">{error}</p>}<footer className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300">Cancelar</button><button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Salvando...":"Salvar alterações"}</button></footer></form></div>}
