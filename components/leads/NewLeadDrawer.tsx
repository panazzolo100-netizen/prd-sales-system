"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { OPPORTUNITY_SERVICE_TYPES, serviceTypeConfig, type OpportunityServiceType, type ServiceField } from "@/lib/opportunity-service-types";

type Props = { open: boolean; onClose(): void; onCreated(): void };
const control = "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500";

function DynamicField({ field }: { field: ServiceField }) {
  if (field.type === "boolean") return <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300"><input type="checkbox" name={`detail.${field.key}`} className="h-4 w-4 accent-orange-500" />{field.label}</label>;
  if (field.type === "select") return <label className="space-y-2 text-sm text-zinc-400"><span>{field.label}</span><select name={`detail.${field.key}`} className={control}><option value="">Selecione</option>{field.options?.map(option=><option key={option}>{option}</option>)}</select></label>;
  if (field.type === "textarea") return <label className="space-y-2 text-sm text-zinc-400 sm:col-span-2"><span>{field.label}</span><textarea name={`detail.${field.key}`} rows={3} className={control} /></label>;
  return <label className="space-y-2 text-sm text-zinc-400"><span>{field.label}{field.unit ? ` (${field.unit})` : ""}</span><input name={`detail.${field.key}`} type={field.type === "number" ? "number" : "text"} step="any" className={control} /></label>;
}

export function NewLeadDrawer({ open, onClose, onCreated }: Props) {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [serviceType,setServiceType]=useState<OpportunityServiceType>("USINA_SOLAR");
  if(!open) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(null);
    const form=new FormData(event.currentTarget); const serviceDetails: Record<string,string|number|boolean>={};
    for(const field of serviceTypeConfig[serviceType].fields){ const raw=form.get(`detail.${field.key}`); if(field.type === "boolean") serviceDetails[field.key]=raw === "on"; else if(raw !== null && String(raw).trim()) serviceDetails[field.key]=field.type === "number" ? Number(raw) : String(raw).trim(); }
    const payload={companyName:form.get("companyName"),contactName:form.get("contactName"),phone:form.get("phone"),email:form.get("email"),city:form.get("city"),state:form.get("state"),serviceType,serviceDetails,estimatedValue:Number(form.get("estimatedValue")||0),source:form.get("source"),notes:form.get("notes"),distributor:serviceTypeConfig[serviceType].solar ? serviceDetails.distributor : null,consumerUnit:serviceTypeConfig[serviceType].solar ? serviceDetails.consumerUnit : null,consumptionKwh:serviceTypeConfig[serviceType].solar ? Number(serviceDetails.monthlyConsumption||0) : null,demandKw:serviceTypeConfig[serviceType].solar ? Number(serviceDetails.demand||0) : null,expectedSaving:serviceTypeConfig[serviceType].solar ? Number(serviceDetails.targetSaving||0) : null};
    try { const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const data=await response.json(); if(!response.ok) throw new Error(data.error ?? "Erro ao salvar oportunidade."); onCreated(); onClose(); }
    catch(err){setError(err instanceof Error?err.message:"Erro ao salvar oportunidade.");} finally{setLoading(false);}
  }

  return <div className="fixed inset-0 z-50 flex justify-end bg-black/60"><div className="h-full w-full max-w-3xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
    <header className="mb-8 flex items-start justify-between"><div><h2 className="text-2xl font-bold text-white">Nova oportunidade</h2><p className="text-sm text-zinc-400">Dados básicos e especificações compatíveis com o serviço.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"><X size={22}/></button></header>
    <form onSubmit={submit} className="space-y-7"><section><h3 className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-orange-400">Dados básicos</h3><div className="grid gap-4 sm:grid-cols-2">
      <input name="companyName" placeholder="Empresa" required className={control}/><input name="contactName" placeholder="Nome do contato" required className={control}/><input name="phone" placeholder="Telefone" className={control}/><input name="email" type="email" placeholder="E-mail" className={control}/><input name="city" placeholder="Cidade" className={control}/><input name="state" placeholder="UF" maxLength={2} className={control}/>
      <label className="space-y-2 text-sm text-zinc-400 sm:col-span-2"><span>Tipo de serviço *</span><select required value={serviceType} onChange={e=>setServiceType(e.target.value as OpportunityServiceType)} className={control}>{OPPORTUNITY_SERVICE_TYPES.map(type=><option key={type} value={type}>{serviceTypeConfig[type].label}</option>)}</select></label>
      <input name="estimatedValue" type="number" step="any" placeholder="Valor estimado" className={control}/><input name="source" placeholder="Origem" className={control}/><textarea name="notes" rows={3} placeholder="Observações comerciais" className={`${control} sm:col-span-2`}/>
    </div></section>
    <section><h3 className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-orange-400">Especificações do serviço</h3><p className="mb-4 text-sm text-zinc-500">{serviceTypeConfig[serviceType].label} · {serviceTypeConfig[serviceType].category}</p><div className="grid gap-4 sm:grid-cols-2">{serviceTypeConfig[serviceType].fields.map(field=><DynamicField key={field.key} field={field}/>)}</div></section>
    {error&&<p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    <footer className="flex justify-end gap-3 border-t border-zinc-800 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300">Cancelar</button><button disabled={loading} className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-60">{loading?"Salvando...":"Salvar oportunidade"}</button></footer>
    </form></div></div>;
}
