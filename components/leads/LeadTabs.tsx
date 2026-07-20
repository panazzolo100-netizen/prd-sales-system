"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus } from "lucide-react";

import { LeadDimensioning } from "@/components/leads/LeadDimensioning";
import type { LeadListItem } from "@/types/lead";

export type LeadTab =
  | "Resumo"
  | "Timeline"
  | "Propostas"
  | "Engenharia"
  | "Dimensionamento"
  | "Arquivos";

const tabs: LeadTab[] = [
  "Resumo",
  "Timeline",
  "Propostas",
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
    }[];

    proposal?: {
      id: string;
      title: string;
      amount: number;
      status: string;
      validUntil: Date | null;
      createdAt: Date;

      systemPower: number | null;
      monthlySaving: number | null;
      annualSaving: number | null;
      payback: number | null;
    };

    files?: {
      id: string;
      name: string;
      url: string;
      size: number;
      createdAt: Date;
    }[];
  };

  initialTab?: LeadTab;
};


export function LeadTabs({
  lead,
  initialTab = "Resumo",
}: Props) {
  const [active, setActive] =
    useState<LeadTab>(initialTab);

  useEffect(() => {
    setActive(initialTab);
  }, [initialTab, lead.id]);

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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold text-white">
              Dados do Lead
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Empresa"
                value={lead.companyName}
              />

              <Info
                label="Contato"
                value={lead.contactName}
              />

              <Info
                label="Telefone"
                value={lead.phone ?? "-"}
              />

              <Info
                label="Cidade"
                value={`${lead.city ?? "-"} ${
                  lead.state ?? ""
                }`}
              />

              <Info
                label="Consumo"
                value={`${
                  lead.consumptionKwh ?? 0
                } kWh`}
              />

              <Info
                label="Valor estimado"
                value={new Intl.NumberFormat(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                ).format(
                  lead.estimatedValue ?? 0
                )}
              />
            </div>
          </div>
        )}

        {active === "Timeline" && (
          <LeadTimeline lead={lead} />
        )}

        {active === "Propostas" && (
          <LeadProposals lead={lead} />
        )}

        {active === "Engenharia" && (
          <LeadEngineering lead={lead} />
        )}

        {active === "Dimensionamento" && (
          <LeadDimensioning lead={lead} />
        )}

        {active === "Arquivos" && (
          <LeadFiles lead={lead} />
        )}
      </div>
    </>
  );
}










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
function LeadTimeline({ lead }: Props) {
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
                {activity.title}
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                {activity.type}
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





function LeadProposals({ lead }: Props) {


  const router = useRouter();


  const [title,setTitle] = useState("");

  const [amount,setAmount] = useState("");

  const [saving,setSaving] = useState(false);



  const proposal = lead.proposal;

async function createProposal() {
  if (!title || !amount) return;

  setSaving(true);

  const response = await fetch("/api/proposals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      leadId: lead.id,
      title,
      amount: Number(amount),
    }),
  });

  if (response.ok) {
    setTitle("");
    setAmount("");
    router.refresh();
  }

  setSaving(false);
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

            <div class="subtitle">
              Proposta Comercial de Energia Solar
            </div>
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

        <section class="section">
          <div class="section-title">Sistema Fotovoltaico</div>

          <div class="grid">
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
          </div>
        </section>

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



      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">


        <h3 className="text-lg font-bold text-white">

          Nova proposta

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



        <button

          onClick={createProposal}

          disabled={saving}

          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"

        >

          <Plus size={18}/>

          {saving
            ? "Salvando..."
            : "Criar proposta"}

        </button>


      </div>




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

    <div>
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
    </div>

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
      className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
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



    </div>

  );

}
function LeadFiles({ lead }: Props) {

  const router = useRouter();


  async function upload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) return;



    const formData = new FormData();


    formData.append(
      "leadId",
      lead.id
    );


    formData.append(
      "file",
      file
    );



    await fetch(
      "/api/leads/files",
      {
        method:"POST",
        body:formData,
      }
    );


    router.refresh();

  }



  return (

    <div className="space-y-5">


      <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 p-8 text-zinc-400 hover:border-orange-500">

        <Upload size={20}/>

        Enviar arquivo


        <input

          type="file"

          onChange={upload}

          className="hidden"

        />


      </label>



      {(lead.files ?? []).length === 0 ? (

        <EmptyState
          text="Nenhum arquivo enviado."
        />


      ) : (


        <div className="space-y-3">


          {(lead.files ?? []).map((file)=>(


            <a

              key={file.id}

              href={file.url}

              target="_blank"

              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white hover:border-orange-500"

            >

              {file.name}

            </a>


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