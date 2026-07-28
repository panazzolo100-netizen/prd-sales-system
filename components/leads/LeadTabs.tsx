"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus } from "lucide-react";

import { LeadDimensioning } from "@/components/leads/LeadDimensioning";
import type { ProposalExcelPreview } from "@/lib/proposal-excel";
import type { LeadListItem } from "@/types/lead";
import { inferLegacyServiceType, isSolarService, serviceTypeConfig, serviceTypeLabel, type OpportunityServiceType, type ServiceField } from "@/lib/opportunity-service-types";

export type LeadTab =
  | "Resumo"
  | "Timeline"
  | "Proposta"
  | "Engenharia"
  | "Dimensionamento"
  | "Arquivos";

const allTabs: LeadTab[] = [
  "Resumo",
  "Timeline",
  "Proposta",
  "Engenharia",
  "Dimensionamento",
  "Arquivos",
];

type Props = {
  lead: LeadListItem & {
    activities?: {
      id: string;
      type: string;
      title: string;
      notes: string | null;
      createdAt: Date;
      user?: {
        name: string;
      } | null;
    }[];

    proposal?: {
      id: string;
      title: string;
      amount: number;
      status: string;
      validUntil: Date | null;
      paymentTerms: string | null;
      executionDeadline: string | null;
      commercialNotes: string | null;
      createdAt: Date;
      updatedAt: Date;

      systemPower: number | null;
      monthlySaving: number | null;
      annualSaving: number | null;
      payback: number | null;
    } | null;

    files?: {
      id: string;
      name: string;
      storageReference: string;
      accessUrl: string | null;
      mimeType: string;
      size: number;
      createdAt: Date;
    }[];
  };

  initialTab?: LeadTab;
  hiddenTabs?: LeadTab[];
  showActivityAuthors?: boolean;
  onLeadChange?: (lead: LeadListItem) => void;
};


export function LeadTabs({
  lead,
  initialTab = "Resumo",
  hiddenTabs = [],
  showActivityAuthors = false,
  onLeadChange,
}: Props) {
  const resolvedType = inferLegacyServiceType(lead);
  const solar = isSolarService(resolvedType);
  const tabs = allTabs.filter(
    (tab) =>
      !hiddenTabs.includes(tab) &&
      (tab !== "Dimensionamento" || solar)
  );
  const [active, setActive] =
    useState<LeadTab>(initialTab);

  useEffect(() => {
    setActive(initialTab === "Dimensionamento" && !solar ? "Resumo" : initialTab);
  }, [initialTab, lead.id, solar]);

  return (
    <>
      <div className="overflow-x-auto border-b border-zinc-800">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                active === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {active === "Resumo" && (
          <OpportunitySummary lead={lead} resolvedType={resolvedType} />
        )}

        {active === "Timeline" && (
          <LeadTimeline
            lead={lead}
            showActivityAuthors={showActivityAuthors}
          />
        )}

        {active === "Proposta" && (
          <LeadProposals
            lead={lead}
            onLeadChange={onLeadChange}
          />
        )}

        {active === "Engenharia" && (
          solar ? <LeadEngineering lead={lead} /> : <ServiceEngineeringEditor lead={lead} serviceType={resolvedType} />
        )}

        {active === "Dimensionamento" && solar && (
          <LeadDimensioning lead={lead} />
        )}

        {active === "Arquivos" && (
          <LeadFiles lead={lead} />
        )}
      </div>
    </>
  );
}










function displayValue(value: unknown, field?: ServiceField) {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return null;
  return `${String(value)}${field?.unit ? ` ${field.unit}` : ""}`;
}

function OpportunitySummary({ lead, resolvedType }: { lead: Props["lead"]; resolvedType: OpportunityServiceType | null }) {
  const details = lead.serviceDetails ?? {};
  const fields = resolvedType ? serviceTypeConfig[resolvedType].fields : [];
  const filled = fields.map(field => ({ field, value: displayValue(details[field.key], field) })).filter(item => item.value);
  const base = [
    ["Empresa", lead.companyName], ["Contato", lead.contactName], ["Telefone", lead.phone], ["E-mail", lead.email],
    ["Cidade", [lead.city, lead.state].filter(Boolean).join(" - ")], ["Tipo de serviço", serviceTypeLabel(resolvedType)],
    ["Status", lead.status], ["Valor estimado", new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(lead.estimatedValue ?? 0)],
    ["Responsável", lead.owner?.name], ["Origem", lead.source], ["Observações", lead.notes],
    ["Criada em", new Date(lead.createdAt).toLocaleDateString("pt-BR")], ["Atualizada em", new Date(lead.updatedAt).toLocaleDateString("pt-BR")],
  ].filter(([,value])=>value);
  return <div className="space-y-5"><section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-bold text-white">Resumo da oportunidade</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{base.map(([label,value])=><Info key={String(label)} label={String(label)} value={String(value)}/>)}</div></section>
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-bold text-white">Especificações do serviço</h2>{filled.length?<div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filled.map(({field,value})=><Info key={field.key} label={field.label} value={value!}/>)}</div>:<p className="mt-3 text-sm text-zinc-500">Nenhuma especificação preenchida para este serviço.</p>}</section></div>;
}

function ServiceEngineeringEditor({ lead, serviceType }: { lead: Props["lead"]; serviceType: OpportunityServiceType | null }) {
  const router=useRouter(); const [saving,setSaving]=useState(false); const [message,setMessage]=useState<string|null>(null);
  if(!serviceType) return <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">Selecione o tipo de serviço em “Editar oportunidade” para liberar a Engenharia.</div>;
  const fields=serviceTypeConfig[serviceType].engineeringFields;
  async function save(event: React.FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);setMessage(null);const data=new FormData(event.currentTarget);const details={...(lead.serviceDetails??{})};for(const field of fields){const raw=data.get(field.key);details[field.key]=field.type==="boolean"?raw==="on":field.type==="number"?Number(raw||0):String(raw??"");}try{const response=await fetch("/api/leads",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:lead.id,serviceType,serviceDetails:details})});if(!response.ok)throw new Error();setMessage("Dados técnicos salvos.");router.refresh();}catch{setMessage("Não foi possível salvar os dados técnicos.");}finally{setSaving(false);}}
  return <form onSubmit={save} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-orange-400">Engenharia · {serviceTypeLabel(serviceType)}</p><h2 className="mt-1 text-xl font-bold text-white">Dados técnicos específicos</h2></div><div className="grid gap-4 sm:grid-cols-2">{fields.map(field=><EngineeringField key={field.key} field={field} value={lead.serviceDetails?.[field.key]}/>)}</div><div className="mt-5 flex items-center justify-between gap-3">{message&&<p className="text-sm text-zinc-400">{message}</p>}<button disabled={saving} className="ml-auto rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Salvando...":"Salvar dados técnicos"}</button></div></form>;
}

function EngineeringField({field,value}:{field:ServiceField;value:unknown}){const cls="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white";if(field.type==="boolean")return <label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300"><input type="checkbox" name={field.key} defaultChecked={value===true}/>{field.label}</label>;if(field.type==="textarea")return <label className="space-y-2 sm:col-span-2"><span className="text-sm text-zinc-400">{field.label}</span><textarea name={field.key} defaultValue={String(value??"")} rows={3} className={cls}/></label>;return <label className="space-y-2"><span className="text-sm text-zinc-400">{field.label}</span><input name={field.key} type={field.type==="number"?"number":"text"} defaultValue={String(value??"")} className={cls}/></label>}

function LeadEngineering({ lead }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    systemType: "",
    installedPower: "",
    modules: "",
    modulePower: "",
    moduleBrand: "",
    inverter: "",

    distributor: "",
    consumerUnit: "",
    tariffGroup: "",
    consumerClass: "",
    contractedDemand: "",
    measuredDemand: "",

    roofType: "",
    roofArea: "",
    roofOrientation: "",
    roofSlope: "",
    shading: "",
    structureType: "",

    voltage: "",
    phase: "",

    notes: "",
  });



  async function loadEngineering() {

    const response = await fetch(
      `/api/leads/engineering?leadId=${lead.id}`,
      {
        cache: "no-store",
      }
    );


    if (!response.ok) return;


    const data = await response.json();



    setForm({

      systemType: data?.systemType ?? "",

      installedPower:
        data?.installedPower?.toString() ?? "",

      modules:
        data?.modules?.toString() ?? "",

      modulePower:
        data?.modulePower?.toString() ?? "",

      moduleBrand:
        data?.moduleBrand ?? "",

      inverter:
        data?.inverter ?? "",



      distributor:
        data?.distributor ?? "",

      consumerUnit:
        data?.consumerUnit ?? "",

      tariffGroup:
        data?.tariffGroup ?? "",

      consumerClass:
        data?.consumerClass ?? "",

      contractedDemand:
        data?.contractedDemand?.toString() ?? "",

      measuredDemand:
        data?.measuredDemand?.toString() ?? "",



      roofType:
        data?.roofType ?? "",

      roofArea:
        data?.roofArea?.toString() ?? "",

      roofOrientation:
        data?.roofOrientation ?? "",

      roofSlope:
        data?.roofSlope?.toString() ?? "",

      shading:
        data?.shading ?? "",

      structureType:
        data?.structureType ?? "",



      voltage:
        data?.voltage ?? "",

      phase:
        data?.phase ?? "",



      notes:
        data?.notes ?? "",

    });

  }



  useEffect(() => {

    loadEngineering();

  }, [lead.id]);




  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {

    setForm((old)=>({

      ...old,

      [e.target.name]: e.target.value,

    }));

  }




  async function saveEngineering(){

    setSaving(true);


    const response = await fetch(
      "/api/leads/engineering",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },


        body:JSON.stringify({

          leadId:lead.id,


          systemType:form.systemType,

          installedPower:
            Number(form.installedPower) || null,

          modules:
            Number(form.modules) || null,


          modulePower:
            Number(form.modulePower) || null,


          moduleBrand:
            form.moduleBrand,


          inverter:
            form.inverter,



          distributor:
            form.distributor,

          consumerUnit:
            form.consumerUnit,

          tariffGroup:
            form.tariffGroup,

          consumerClass:
            form.consumerClass,


          contractedDemand:
            Number(form.contractedDemand) || null,


          measuredDemand:
            Number(form.measuredDemand) || null,



          roofType:
            form.roofType,


          roofArea:
            Number(form.roofArea) || null,


          roofOrientation:
            form.roofOrientation,


          roofSlope:
            Number(form.roofSlope) || null,


          shading:
            form.shading,


          structureType:
            form.structureType,



          voltage:
            form.voltage,


          phase:
            form.phase,


          notes:
            form.notes,

        }),
      }
    );



    if(!response.ok){

      alert("Erro ao salvar engenharia.");

      setSaving(false);

      return;

    }



    await loadEngineering();


    router.refresh();


    setSaving(false);

  }




  return (

    <div className="space-y-8">


      <div>

        <h3 className="mb-4 text-lg font-bold text-white">
          Sistema Fotovoltaico
        </h3>


        <div className="grid grid-cols-2 gap-6">


          <Input
            label="Tipo do sistema"
            name="systemType"
            value={form.systemType}
            onChange={handleChange}
          />


          <Input
            label="Potência instalada kWp"
            name="installedPower"
            type="number"
            value={form.installedPower}
            onChange={handleChange}
          />


          <Input
            label="Quantidade de módulos"
            name="modules"
            type="number"
            value={form.modules}
            onChange={handleChange}
          />


          <Input
            label="Potência módulo W"
            name="modulePower"
            type="number"
            value={form.modulePower}
            onChange={handleChange}
          />


          <Input
            label="Marca módulo"
            name="moduleBrand"
            value={form.moduleBrand}
            onChange={handleChange}
          />


          <Input
            label="Inversor"
            name="inverter"
            value={form.inverter}
            onChange={handleChange}
          />


        </div>

      </div>



      <div>

        <h3 className="mb-4 text-lg font-bold text-white">
          Unidade Consumidora
        </h3>


        <div className="grid grid-cols-2 gap-6">


          <Input
            label="Distribuidora"
            name="distributor"
            value={form.distributor}
            onChange={handleChange}
          />


          <Input
            label="Unidade consumidora"
            name="consumerUnit"
            value={form.consumerUnit}
            onChange={handleChange}
          />


          <Input
            label="Grupo tarifário"
            name="tariffGroup"
            value={form.tariffGroup}
            onChange={handleChange}
          />


          <Input
            label="Classe consumo"
            name="consumerClass"
            value={form.consumerClass}
            onChange={handleChange}
          />


          <Input
            label="Demanda contratada kW"
            name="contractedDemand"
            type="number"
            value={form.contractedDemand}
            onChange={handleChange}
          />


          <Input
            label="Demanda medida kW"
            name="measuredDemand"
            type="number"
            value={form.measuredDemand}
            onChange={handleChange}
          />

        </div>

      </div>



      <div>

        <h3 className="mb-4 text-lg de bold text-white">
          Telhado e instalação
        </h3>


        <div className="grid grid-cols-2 gap-6">


          <Input
            label="Tipo telhado"
            name="roofType"
            value={form.roofType}
            onChange={handleChange}
          />


          <Input
            label="Área telhado m²"
            name="roofArea"
            type="number"
            value={form.roofArea}
            onChange={handleChange}
          />


          <Input
            label="Orientação"
            name="roofOrientation"
            value={form.roofOrientation}
            onChange={handleChange}
          />


          <Input
            label="Inclinação"
            name="roofSlope"
            type="number"
            value={form.roofSlope}
            onChange={handleChange}
          />


          <Input
            label="Sombreamento"
            name="shading"
            value={form.shading}
            onChange={handleChange}
          />


          <Input
            label="Estrutura"
            name="structureType"
            value={form.structureType}
            onChange={handleChange}
          />

        </div>

      </div>



      <div className="grid grid-cols-2 gap-6">

        <Input
          label="Tensão"
          name="voltage"
          value={form.voltage}
          onChange={handleChange}
        />


        <Input
          label="Fase"
          name="phase"
          value={form.phase}
          onChange={handleChange}
        />

      </div>



      <textarea

        name="notes"

        value={form.notes}

        onChange={handleChange}

        placeholder="Observações técnicas"

        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white"

      />



      <div className="flex justify-end">

        <button

          onClick={saveEngineering}

          disabled={saving}

          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white"

        >

          {saving
            ? "Salvando..."
            : "Salvar Engenharia"}

        </button>


      </div>


    </div>

  );
}
function LeadTimeline({ lead, showActivityAuthors = false }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const activities = lead.activities ?? [];

  async function createActivity() {
    if (!title.trim()) {
      alert("Informe o título.");
      return;
    }

    setSaving(true);

    const response = await fetch("/api/leads/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: lead.id,
        type: "MANUAL",
        title,
        notes,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      alert("Erro ao criar atividade.");
      return;
    }

    setTitle("");
    setNotes("");

    router.refresh();
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">

        <h3 className="text-lg font-bold text-white">
          Nova Atividade
        </h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white"
        />

        <button
          onClick={createActivity}
          disabled={saving}
          className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
        >
          {saving ? "Salvando..." : "Criar Atividade"}
        </button>

      </div>

      {activities.length === 0 ? (
        <EmptyState text="Nenhuma atividade registrada." />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <h3 className="font-bold text-white">
                {showActivityAuthors && activity.user?.name
                  ? `${activity.user.name.toLocaleUpperCase("pt-BR")} ${activity.title.charAt(0).toLocaleLowerCase("pt-BR")}${activity.title.slice(1)}`
                  : activity.title}
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                {activity.type} ·{" "}
                {new Date(activity.createdAt).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>

              {activity.notes && (
                <p className="mt-3 text-zinc-300">
                  {activity.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}





function LeadProposals({ lead, onLeadChange }: Props) {
  const [editing, setEditing] = useState(!lead.proposal);
  const [title,setTitle] = useState(lead.proposal?.title ?? "");

  const [amount,setAmount] = useState(
    lead.proposal ? String(lead.proposal.amount) : ""
  );

  const [saving,setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState(lead.proposal?.status ?? "RASCUNHO");
  const [validUntil, setValidUntil] = useState(
    lead.proposal?.validUntil
      ? new Date(lead.proposal.validUntil).toISOString().slice(0, 10)
      : ""
  );
  const [paymentTerms, setPaymentTerms] = useState(lead.proposal?.paymentTerms ?? "");
  const [executionDeadline, setExecutionDeadline] = useState(lead.proposal?.executionDeadline ?? "");
  const [commercialNotes, setCommercialNotes] = useState(lead.proposal?.commercialNotes ?? "");



  const proposal = lead.proposal;
  const proposalServiceType = inferLegacyServiceType(lead);
  const solarProposal = isSolarService(proposalServiceType);

  useEffect(() => {
    setTitle(lead.proposal?.title ?? "");
    setAmount(lead.proposal ? String(lead.proposal.amount) : "");
    setStatus(lead.proposal?.status ?? "RASCUNHO");
    setValidUntil(
      lead.proposal?.validUntil
        ? new Date(lead.proposal.validUntil).toISOString().slice(0, 10)
        : ""
    );
    setPaymentTerms(lead.proposal?.paymentTerms ?? "");
    setExecutionDeadline(lead.proposal?.executionDeadline ?? "");
    setCommercialNotes(lead.proposal?.commercialNotes ?? "");
    setEditing(!lead.proposal);
  }, [lead.id, lead.proposal]);

  function restorePersistedValues() {
    setTitle(proposal?.title ?? "");
    setAmount(proposal ? String(proposal.amount) : "");
    setStatus(proposal?.status ?? "RASCUNHO");
    setValidUntil(
      proposal?.validUntil
        ? new Date(proposal.validUntil).toISOString().slice(0, 10)
        : ""
    );
    setPaymentTerms(proposal?.paymentTerms ?? "");
    setExecutionDeadline(proposal?.executionDeadline ?? "");
    setCommercialNotes(proposal?.commercialNotes ?? "");
    setSaveError(null);
    setSaveSuccess(null);
  }

  function startEditing() {
    restorePersistedValues();
    setEditing(true);
  }

  function cancelEditing() {
    restorePersistedValues();
    setEditing(false);
  }

async function createProposal() {
  if (!title || !amount) return;

  setSaving(true);
  setSaveError(null);
  setSaveSuccess(null);

  try {
    const response = await fetch("/api/proposals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: lead.id,
        title,
        amount: Number(amount),
        status,
        validUntil: validUntil || null,
        paymentTerms: paymentTerms.trim() || null,
        executionDeadline: executionDeadline.trim() || null,
        commercialNotes: commercialNotes.trim() || null,
      }),
    });
    const savedProposal = await response.json();
    if (!response.ok) {
      throw new Error(savedProposal.error ?? "Não foi possível salvar a proposta.");
    }

    onLeadChange?.({
      ...lead,
      proposal: savedProposal,
      estimatedValue: savedProposal.leadEstimatedValue,
      updatedAt: savedProposal.leadUpdatedAt,
    });
    setTitle(savedProposal.title);
    setAmount(String(savedProposal.amount));
    setEditing(false);
    setSaveSuccess("Proposta atualizada com sucesso.");
  } catch (error) {
    setSaveError(
      error instanceof Error
        ? error.message
        : "Não foi possível salvar a proposta."
    );
  } finally {
    setSaving(false);
  }
}

function generatePdf() {
  if (!proposal) return;

  const pdfWindow = window.open("", "_blank");

  if (!pdfWindow) {
    alert("Permita pop-ups para gerar o PDF.");
    return;
  }

  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  pdfWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>${proposal.title}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, sans-serif;
            color: #18181b;
            background: #ffffff;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 4px solid #f97316;
            padding-bottom: 24px;
            margin-bottom: 32px;
          }

          .brand {
            font-size: 34px;
            font-weight: 800;
          }

          .brand span {
            color: #f97316;
          }

          .subtitle {
            margin-top: 6px;
            color: #71717a;
          }

          .proposal-number {
            text-align: right;
            color: #52525b;
          }

          .section {
            margin-bottom: 28px;
          }

          .section-title {
            margin-bottom: 14px;
            font-size: 18px;
            font-weight: 700;
            color: #f97316;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .card {
            padding: 18px;
            border: 1px solid #e4e4e7;
            border-radius: 10px;
          }

          .label {
            margin-bottom: 6px;
            font-size: 12px;
            text-transform: uppercase;
            color: #71717a;
          }

          .value {
            font-size: 18px;
            font-weight: 700;
          }

          .price {
            padding: 26px;
            border-radius: 12px;
            color: #ffffff;
            background: #18181b;
            text-align: center;
          }

          .price-label {
            font-size: 14px;
            color: #d4d4d8;
          }

          .price-value {
            margin-top: 8px;
            font-size: 36px;
            font-weight: 800;
            color: #f97316;
          }

          .footer {
            margin-top: 50px;
            padding-top: 18px;
            border-top: 1px solid #d4d4d8;
            text-align: center;
            font-size: 12px;
            color: #71717a;
          }

          @media print {
            body {
              padding: 20px;
            }

            @page {
              size: A4;
              margin: 15mm;
            }
          }
        </style>
      </head>

      <body>
        <header class="header">
          <div>
            <div class="brand">
              PRD <span>Engenharia</span>
            </div>

            <div class="subtitle">Proposta Comercial · ${serviceTypeLabel(proposalServiceType)}</div>
          </div>

          <div class="proposal-number">
            <strong>${proposal.title}</strong>
            <br />
            ${new Date().toLocaleDateString("pt-BR")}
          </div>
        </header>

        <section class="section">
          <div class="section-title">Cliente</div>

          <div class="grid">
            <div class="card">
              <div class="label">Empresa</div>
              <div class="value">${lead.companyName}</div>
            </div>

            <div class="card">
              <div class="label">Contato</div>
              <div class="value">${lead.contactName}</div>
            </div>

            <div class="card">
              <div class="label">Telefone</div>
              <div class="value">${lead.phone ?? "-"}</div>
            </div>

            <div class="card">
              <div class="label">Localização</div>
              <div class="value">
                ${lead.city ?? "-"}${lead.state ? ` - ${lead.state}` : ""}
              </div>
            </div>
          </div>
        </section>

        ${solarProposal ? `<section class="section"><div class="section-title">Sistema Fotovoltaico</div><div class="grid">
            <div class="card">
              <div class="label">Potência instalada</div>
              <div class="value">${proposal.systemPower ?? "-"} kWp</div>
            </div>

            <div class="card">
              <div class="label">Economia mensal estimada</div>
              <div class="value">
                ${currency.format(proposal.monthlySaving ?? 0)}
              </div>
            </div>

            <div class="card">
              <div class="label">Economia anual estimada</div>
              <div class="value">
                ${currency.format(proposal.annualSaving ?? 0)}
              </div>
            </div>

            <div class="card">
              <div class="label">Retorno estimado</div>
              <div class="value">${proposal.payback ?? "-"} anos</div>
            </div>
          </div></section>` : `<section class="section"><div class="section-title">Serviço proposto</div><div class="card"><div class="label">Tipo de serviço</div><div class="value">${serviceTypeLabel(proposalServiceType)}</div></div></section>`}

        <section class="price">
          <div class="price-label">Investimento total</div>

          <div class="price-value">
            ${currency.format(proposal.amount)}
          </div>
        </section>

        <footer class="footer">
          PRD Soluções em Engenharia — Proposta sujeita à análise técnica e comercial.
        </footer>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  pdfWindow.document.close();
}



  return (

    <div className="space-y-6">



      {editing && <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">


        <h3 className="text-lg font-bold text-white">

          {proposal ? "Editar proposta" : "Nova proposta"}

        </h3>



        <input

          value={title}

          onChange={(e)=>setTitle(e.target.value)}

          placeholder="Nome da proposta"

          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"

        />



        <input

          value={amount}

          onChange={(e)=>setAmount(e.target.value)}

          type="number"

          placeholder="Valor"

          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"

        />



        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
          >
            {["RASCUNHO", "ENVIADA", "EM_NEGOCIACAO", "APROVADA", "RECUSADA", "EXPIRADA", "CANCELADA", "CONCLUIDA"].map((item) => (
              <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
            ))}
          </select>
          <input
            type="date"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white"
          />
        </div>

        <input value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} placeholder="Condições de pagamento" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" />
        <input value={executionDeadline} onChange={(event) => setExecutionDeadline(event.target.value)} placeholder="Prazo de execução" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" />
        <textarea value={commercialNotes} onChange={(event) => setCommercialNotes(event.target.value)} placeholder="Observações comerciais" rows={3} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white" />

        <div className="flex flex-wrap gap-3">
        <button
          type="button"

          onClick={createProposal}

          disabled={saving}

          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"

        >

          <Plus size={18}/>

          {saving
            ? "Salvando..."
            : proposal
              ? "Salvar proposta"
              : "Criar proposta"}

        </button>
        {proposal && (
          <button type="button" onClick={cancelEditing} disabled={saving} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-300 disabled:opacity-50">
            Cancelar
          </button>
        )}
        </div>
        {saveError && (
          <p role="alert" className="text-sm font-medium text-red-400">
            {saveError}
          </p>
        )}


      </div>}




      {!proposal ? (

        <EmptyState
          text="Nenhuma proposta cadastrada."
        />


      ) : (


        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">

  <div className="flex items-center justify-between">

    <div>

      <h3 className="text-xl font-bold text-white">
        {proposal.title}
      </h3>

      <p className="text-zinc-400">
        {proposal.status}
      </p>

    </div>

    <h2 className="text-3xl font-bold text-orange-500">
      {new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(proposal.amount)}
    </h2>

  </div>

  <div className="grid grid-cols-2 gap-4">

    <div><p className="text-xs text-zinc-500">Tipo de serviço</p><p className="text-white">{serviceTypeLabel(proposalServiceType)}</p></div>
    <div><p className="text-xs text-zinc-500">Validade</p><p className="text-white">{proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString("pt-BR") : "Não informada"}</p></div>
    <div><p className="text-xs text-zinc-500">Criada em</p><p className="text-white">{new Date(proposal.createdAt).toLocaleString("pt-BR")}</p></div>
    <div><p className="text-xs text-zinc-500">Última atualização</p><p className="text-white">{new Date(proposal.updatedAt).toLocaleString("pt-BR")}</p></div>

    {solarProposal && <><div>
      <p className="text-xs text-zinc-500">Potência</p>
      <p className="text-white">
        {proposal.systemPower ?? "-"} kWp
      </p>
    </div>

    <div>
      <p className="text-xs text-zinc-500">Economia Mensal</p>
      <p className="text-white">
        R$ {proposal.monthlySaving ?? "-"}
      </p>
    </div></>}

    <div>
      <p className="text-xs text-zinc-500">Economia Anual</p>
      <p className="text-white">
        R$ {proposal.annualSaving ?? "-"}
      </p>
    </div>

    <div>
      <p className="text-xs text-zinc-500">Payback</p>
      <p className="text-white">
        {proposal.payback ?? "-"} anos
      </p>
    </div>

  </div>

  <div className="flex gap-3">

  <button
    type="button"
    onClick={startEditing}
    disabled={saving}
    className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
  >
    Editar
  </button>

  <button
  type="button"
  onClick={generatePdf}
  className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
>
  Gerar PDF
</button>

  </div>

</div>


      )}

      {saveSuccess && !editing && (
        <p role="status" className="text-sm font-medium text-emerald-400">
          {saveSuccess}
        </p>
      )}

      <ProposalAttachments lead={lead} onLeadChange={onLeadChange} />


    </div>

  );

}

type ProposalFileKind = "PROPOSAL_INTERNAL" | "PROPOSAL_CLIENT";

const proposalFileConfig = {
  PROPOSAL_INTERNAL: {
    title: "Proposta interna — Excel",
    description: "Planilha interna para composição e cálculo da proposta.",
    accept: ".xls,.xlsx",
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  PROPOSAL_CLIENT: {
    title: "Proposta para o cliente — PDF",
    description: "Documento final destinado ao cliente.",
    accept: ".pdf",
    mimeTypes: ["application/pdf"],
  },
} as const;

function ProposalAttachments({ lead, onLeadChange }: Props) {
  const [busyKind, setBusyKind] = useState<ProposalFileKind | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: ProposalFileKind;
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [preview, setPreview] = useState<ProposalExcelPreview | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [dismissedPreviewFileId, setDismissedPreviewFileId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function fileFor(kind: ProposalFileKind) {
    if (kind === "PROPOSAL_INTERNAL") {
      return (lead.files ?? []).find(
        (file) =>
          file.storageReference.includes(
            `/leads/${lead.id}/proposal-internal/`
          ) &&
          (
            proposalFileConfig.PROPOSAL_INTERNAL.mimeTypes as readonly string[]
          ).includes(file.mimeType)
      );
    }
    const allowed = proposalFileConfig[kind].mimeTypes as readonly string[];
    return (lead.files ?? []).find((file) => allowed.includes(file.mimeType));
  }

  const internalProposalFile = fileFor("PROPOSAL_INTERNAL");
  const internalProposalFileId = internalProposalFile?.id ?? null;

  const loadPreview = useCallback(async (fileId: string) => {
    setAnalyzing(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/leads/proposal-excel/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, fileId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao analisar proposta.");
      }
      setPreview(result as ProposalExcelPreview);
      setPreviewFileId(fileId);
    } catch (error) {
      setPreview(null);
      setPreviewFileId(null);
      setFeedback({
        kind: "PROPOSAL_INTERNAL",
        type: "error",
        text:
          error instanceof Error ? error.message : "Erro ao analisar proposta.",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [lead.id]);

  useEffect(() => {
    if (!internalProposalFileId) {
      setPreview(null);
      setPreviewFileId(null);
      return;
    }
    if (
      previewFileId !== internalProposalFileId &&
      dismissedPreviewFileId !== internalProposalFileId
    ) {
      void loadPreview(internalProposalFileId);
    }
  }, [
    internalProposalFileId,
    previewFileId,
    dismissedPreviewFileId,
    loadPreview,
  ]);

  async function confirmPreview() {
    if (!previewFileId || confirming) return;
    setConfirming(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/leads/proposal-excel/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, fileId: previewFileId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao confirmar proposta.");
      }
      setPreview(result.preview as ProposalExcelPreview);
      onLeadChange?.({
        ...lead,
        proposal: result.proposal,
        estimatedValue: result.leadEstimatedValue,
        updatedAt: result.leadUpdatedAt,
      });
      setFeedback({
        kind: "PROPOSAL_INTERNAL",
        type: "success",
        text: "Proposta e valor estimado atualizados com sucesso.",
      });
    } catch (error) {
      setFeedback({
        kind: "PROPOSAL_INTERNAL",
        type: "error",
        text:
          error instanceof Error ? error.message : "Erro ao confirmar proposta.",
      });
    } finally {
      setConfirming(false);
    }
  }

  async function requestDelete(id: string) {
    const response = await fetch("/api/leads/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error ?? "Erro ao excluir arquivo.");
    }
  }

  async function deleteFile(id: string, kind: ProposalFileKind) {
    if (!window.confirm("Deseja excluir este arquivo de proposta?")) return;
    setDeletingId(id);
    setFeedback(null);
    try {
      await requestDelete(id);
      onLeadChange?.({
        ...lead,
        files: (lead.files ?? []).filter((file) => file.id !== id),
      });
      if (kind === "PROPOSAL_INTERNAL") {
        setPreview(null);
        setPreviewFileId(null);
        setDismissedPreviewFileId(null);
      }
      setFeedback({ kind, type: "success", text: "Arquivo excluído com sucesso." });
    } catch (error) {
      setFeedback({
        kind,
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao excluir arquivo.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function upload(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: ProposalFileKind
  ) {
    const file = event.target.files?.[0];
    if (!file || busyKind) return;
    const config = proposalFileConfig[kind];
    if (!(config.mimeTypes as readonly string[]).includes(file.type)) {
      setFeedback({
        kind,
        type: "error",
        text:
          kind === "PROPOSAL_INTERNAL"
            ? "Selecione um arquivo Excel (.xls ou .xlsx)."
            : "Selecione um arquivo PDF.",
      });
      event.target.value = "";
      return;
    }

    setBusyKind(kind);
    setFeedback(null);
    const previous = fileFor(kind);
    const formData = new FormData();
    formData.append("leadId", lead.id);
    formData.append("kind", kind);
    formData.append("file", file);

    try {
      const response = await fetch("/api/leads/files", {
        method: "POST",
        body: formData,
      });
      const savedFile = await response.json();
      if (!response.ok) {
        throw new Error(savedFile.error ?? "Erro ao enviar arquivo.");
      }

      let previousRemoved = true;
      if (previous) {
        try {
          await requestDelete(previous.id);
        } catch {
          previousRemoved = false;
        }
      }
      onLeadChange?.({
        ...lead,
        files: [
          savedFile,
          ...(lead.files ?? []).filter(
            (item) => !previousRemoved || item.id !== previous?.id
          ),
        ],
      });
      if (kind === "PROPOSAL_INTERNAL") {
        setDismissedPreviewFileId(null);
        await loadPreview(savedFile.id);
      }
      setFeedback({
        kind,
        type: previousRemoved ? "success" : "error",
        text: previousRemoved
          ? previous
            ? "Arquivo substituído com sucesso."
            : "Arquivo enviado com sucesso."
          : "O novo arquivo foi enviado, mas o anterior não pôde ser removido.",
      });
    } catch (error) {
      setFeedback({
        kind,
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao enviar arquivo.",
      });
    } finally {
      event.target.value = "";
      setBusyKind(null);
    }
  }

  return (
    <div className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-2">
      {(Object.keys(proposalFileConfig) as ProposalFileKind[]).map((kind) => {
        const config = proposalFileConfig[kind];
        const file = fileFor(kind);
        const isBusy = busyKind === kind;
        return (
          <section
            key={kind}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h3 className="text-lg font-bold text-white">{config.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{config.description}</p>

            {file ? (
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="truncate font-semibold text-white">{file.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Enviado em {new Date(file.createdAt).toLocaleString("pt-BR")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`/api/leads/files?id=${encodeURIComponent(file.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-orange-500"
                  >
                    {kind === "PROPOSAL_CLIENT" ? "Abrir / baixar" : "Baixar"}
                  </a>
                  <label className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-orange-500">
                    {isBusy ? "Enviando..." : "Substituir"}
                    <input
                      type="file"
                      accept={config.accept}
                      disabled={isBusy || deletingId === file.id}
                      onChange={(event) => void upload(event, kind)}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isBusy || deletingId === file.id}
                    onClick={() => void deleteFile(file.id, kind)}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === file.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </div>
            ) : (
              <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 p-6 text-sm font-semibold text-zinc-300 hover:border-orange-500">
                <Upload size={18} />
                {isBusy ? "Enviando..." : "Anexar arquivo"}
                <input
                  type="file"
                  accept={config.accept}
                  disabled={isBusy}
                  onChange={(event) => void upload(event, kind)}
                  className="hidden"
                />
              </label>
            )}

            {feedback?.kind === kind && (
              <p
                role="status"
                className={`mt-3 text-sm ${
                  feedback.type === "success"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {feedback.text}
              </p>
            )}
          </section>
        );
      })}
    </div>
    {analyzing && (
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 text-sm font-medium text-orange-400">
        Analisando proposta interna...
      </div>
    )}
    {preview && (
      <ProposalExcelPreviewCard
        preview={preview}
        confirming={confirming}
        onCancel={() => {
          setDismissedPreviewFileId(previewFileId);
          setPreview(null);
          setPreviewFileId(null);
        }}
        onConfirm={() => void confirmPreview()}
      />
    )}
    </div>
  );
}

function ProposalExcelPreviewCard({
  preview,
  confirming,
  onCancel,
  onConfirm,
}: {
  preview: ProposalExcelPreview;
  confirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const currency = (value: number | null) =>
    value === null
      ? "Não disponível"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
  const number = (value: number | null, unit = "") =>
    value === null
      ? "Não disponível"
      : `${new Intl.NumberFormat("pt-BR", {
          maximumFractionDigits: 2,
        }).format(value)}${unit ? ` ${unit}` : ""}`;
  const rows = [
    ["Cliente", preview.client.name ?? "Não informado"],
    ["Potência do sistema", number(preview.system.systemPowerKwp, "kWp")],
    ["Módulos", `${number(preview.system.moduleQuantity)} × ${number(preview.system.modulePowerWp, "Wp")} — ${preview.system.moduleModel ?? "modelo não informado"}`],
    ["Área necessária", number(preview.system.requiredAreaM2, "m²")],
    ["Valor à vista", currency(preview.financial.cashAmount)],
    ["Valor do investimento", currency(preview.financial.investmentAmount)],
    ["Parcelamento", `${number(preview.financial.installments)} × ${currency(preview.financial.installmentAmount)}`],
    ["Materiais elétricos", currency(preview.financial.electricalMaterialsAmount)],
    ["Mão de obra", currency(preview.financial.laborAmount)],
    ["Geração mensal", number(preview.energy.monthlyGenerationKwh, "kWh")],
    ["Geração anual", number(preview.energy.annualGenerationKwh, "kWh")],
  ];
  return (
    <section className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-6">
      <h3 className="text-lg font-bold text-white">
        Resumo da proposta importada
      </h3>
      <p className="mt-1 text-sm text-zinc-400">{preview.source.fileName}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
          </div>
        ))}
      </div>
      {preview.system.inverters.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Inversores
          </p>
          <div className="mt-2 space-y-2">
            {preview.system.inverters.map((inverter, index) => (
              <p key={`${inverter.model}-${index}`} className="text-sm text-zinc-200">
                {inverter.quantity} × {inverter.model ?? "modelo não informado"} — {number(inverter.power)}
              </p>
            ))}
          </div>
        </div>
      )}
      {preview.warnings.length > 0 && (
        <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-300">Avisos de leitura</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-200/80">
            {preview.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming || !preview.financial.cashAmount}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {confirming ? "Atualizando..." : "Confirmar e atualizar oportunidade"}
        </button>
      </div>
    </section>
  );
}

function LeadFiles({ lead }: Props) {

  const router = useRouter();
  const [fileMessage, setFileMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  async function upload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) return;

    setUploading(true);
    setFileMessage("");



    const formData = new FormData();


    formData.append(
      "leadId",
      lead.id
    );


    formData.append(
      "file",
      file
    );



    try {
      const response = await fetch("/api/leads/files", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Erro ao enviar arquivo.");
      setFileMessage("Arquivo enviado com sucesso.");
      event.target.value = "";
      router.refresh();
    } catch (error) {
      setFileMessage(error instanceof Error ? error.message : "Erro ao enviar arquivo.");
    } finally {
      setUploading(false);
    }

  }

  async function removeFile(id: string) {
    if (deletingId || !window.confirm("Deseja excluir este arquivo?")) return;
    setDeletingId(id);
    setFileMessage("");
    try {
      const response = await fetch("/api/leads/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Erro ao excluir arquivo.");
      setFileMessage("Arquivo removido com sucesso.");
      router.refresh();
    } catch (error) {
      setFileMessage(error instanceof Error ? error.message : "Erro ao excluir arquivo.");
    } finally {
      setDeletingId(null);
    }
  }



  return (

    <div className="space-y-5">


      <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 p-8 text-zinc-400 hover:border-orange-500">

        <Upload size={20}/>

        Enviar arquivo


        <input

          type="file"

          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"

          disabled={uploading}

          onChange={upload}

          className="hidden"

        />


      </label>

      {fileMessage && (
        <p className={fileMessage.includes("sucesso") ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
          {fileMessage}
        </p>
      )}



      {(lead.files ?? []).length === 0 ? (

        <EmptyState
          text="Nenhum arquivo enviado."
        />


      ) : (


        <div className="space-y-3">


          {(lead.files ?? []).map((file)=>(


            <div key={file.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <a
                href={`/api/leads/files?id=${encodeURIComponent(file.id)}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-white hover:text-orange-400"
              >
                {file.name}
              </a>
              <button
                type="button"
                onClick={() => void removeFile(file.id)}
                disabled={deletingId === file.id}
                className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {deletingId === file.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>


          ))}


        </div>


      )}


    </div>

  );

}





function Input({

  label,

  name,

  value,

  onChange,

  type="text",

}:{

  label:string;

  name:string;

  value:string;

  type?:string;

  onChange: React.ChangeEventHandler<HTMLInputElement>;

}) {


  return (

    <div>


      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">

        {label}

      </label>



      <input

        name={name}

        value={value}

        type={type}

        onChange={onChange}

        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"

      />


    </div>

  );

}





function Info({

  label,

  value,

}:{

  label:string;

  value:string;

}) {


  return (

    <div>


      <p className="text-xs uppercase tracking-wide text-zinc-500">

        {label}

      </p>


      <p className="mt-1 text-white">

        {value}

      </p>


    </div>

  );

}





function EmptyState({

  text,

}:{

  text:string;

}) {


  return (

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">

      {text}

    </div>

  );

}
