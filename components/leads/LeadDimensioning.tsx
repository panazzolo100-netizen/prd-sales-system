"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type Props = {
  lead: {
    id: string;
    consumptionKwh?: number | null;
  };
};



export function LeadDimensioning({
  lead,
}: Props) {


  const router = useRouter();


  const [saving, setSaving] =
    useState(false);



  const [form, setForm] = useState({

    systemType: "RESIDENCIAL",

    monthlyConsumption: "",

    solarIrradiation: "5.5",

    lossFactor: "20",


    modulePower: "610",

    moduleQuantity: "",


    installedPower: "",

    estimatedGeneration: "",

    requiredArea: "",



    systemValue: "",

    energyTariff: "1.00",


    monthlySaving: "",

    annualSaving: "",

    paybackYears: "",


coveragePercent: "",

  });




  async function loadDimensioning(){


    const response =
      await fetch(
        `/api/leads/dimensioning?leadId=${lead.id}`,
        {
          cache:"no-store",
        }
      );



    if(!response.ok) return;



    const data =
      await response.json();



    if(data){


      setForm({

        systemType:
  data.systemType ?? "RESIDENCIAL",

        monthlyConsumption:
          data.monthlyConsumption?.toString() ?? "",


        solarIrradiation:
          data.solarIrradiation?.toString() ?? "5.5",


        lossFactor:
          data.lossFactor?.toString() ?? "20",


        modulePower:
          data.modulePower?.toString() ?? "610",


        moduleQuantity:
          data.moduleQuantity?.toString() ?? "",


        installedPower:
          data.installedPower?.toString() ?? "",


        estimatedGeneration:
          data.estimatedGeneration?.toString() ?? "",


        requiredArea:
          data.requiredArea?.toString() ?? "",



        systemValue:
          data.systemValue?.toString() ?? "",


        energyTariff:
          data.energyTariff?.toString() ?? "1.00",



        monthlySaving:
          data.monthlySaving?.toString() ?? "",


        annualSaving:
          data.annualSaving?.toString() ?? "",
     
        paybackYears:
        data.paybackYears?.toString() ?? "",

        coveragePercent:
        data.coveragePercent?.toString() ?? "",

});


      return;

    }



    if(lead.consumptionKwh){

      setForm(old=>({

        ...old,

        monthlyConsumption:
          lead.consumptionKwh!.toString(),

      }));

    }

  }





  useEffect(()=>{

    loadDimensioning();

  },[lead.id]);





 function change(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
){

    setForm(old=>({

      ...old,

      [e.target.name]:
        e.target.value,

    }));

  }





  function calculate(){


   

   const consumption =
  Number(form.monthlyConsumption);

const irradiation =
  Number(form.solarIrradiation);

const loss =
  Number(form.lossFactor) / 100;


if(!consumption) return;


const power =
  consumption /
  (
    irradiation *
    30 *
    (1 - loss)
  );
  let minimumPower = 3;


if(form.systemType === "COMERCIAL"){
  minimumPower = 5;
}


if(form.systemType === "INDUSTRIAL"){
  minimumPower = 10;
}


if(form.systemType === "RURAL"){
  minimumPower = 5;
}


if(form.systemType === "USINA SOLO"){
  minimumPower = 20;
}


const finalPower =
  power < minimumPower
    ? minimumPower
    : power;


const modules =
  Math.ceil(
    (
      finalPower * 1000
    )
    /
    Number(form.modulePower)
  );


const generation =
  finalPower *
  irradiation *
  30 *
  (1 - loss);


const area =
  modules * 2.2;


// VALOR ESTIMADO DO SISTEMA
let pricePerKwp = 3500;


if(form.systemType === "RESIDENCIAL"){
  pricePerKwp = 4000;
}


if(form.systemType === "COMERCIAL"){
  pricePerKwp = 3500;
}


if(form.systemType === "INDUSTRIAL"){
  pricePerKwp = 3200;
}


if(form.systemType === "RURAL"){
  pricePerKwp = 3000;
}


if(form.systemType === "USINA SOLO"){
  pricePerKwp = 2800;
}



const estimatedSystemValue =
  finalPower * pricePerKwp;


// ECONOMIA
const monthlySaving =
  consumption *
  Number(form.energyTariff);


const annualSaving =
  monthlySaving * 12;

  const coveragePercent =
  (generation / consumption) * 100;


// PAYBACK
const payback =
  estimatedSystemValue /
  annualSaving;



setForm(old => ({

  ...old,


  installedPower:
    finalPower.toFixed(2),


  moduleQuantity:
    modules.toString(),


  estimatedGeneration:
    generation.toFixed(0),


  requiredArea:
    area.toFixed(0),



  systemValue:
    estimatedSystemValue.toFixed(2),


  monthlySaving:
    monthlySaving.toFixed(2),


  annualSaving:
    annualSaving.toFixed(2),


  paybackYears:
    payback.toFixed(2),

    coveragePercent:
  coveragePercent.toFixed(0),

}));

  }






  async function save(){


    setSaving(true);



    await fetch(
      "/api/leads/dimensioning",
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },


        body:JSON.stringify({

          leadId:lead.id,


          monthlyConsumption:
            Number(form.monthlyConsumption),


          solarIrradiation:
            Number(form.solarIrradiation),


          lossFactor:
            Number(form.lossFactor),


          modulePower:
            Number(form.modulePower),


          moduleQuantity:
            Number(form.moduleQuantity),


          installedPower:
            Number(form.installedPower),


          estimatedGeneration:
            Number(form.estimatedGeneration),


          requiredArea:
            Number(form.requiredArea),



          systemValue:
            Number(form.systemValue),


          energyTariff:
            Number(form.energyTariff),


          monthlySaving:
            Number(form.monthlySaving),


          annualSaving:
            Number(form.annualSaving),


          paybackYears:
            Number(form.paybackYears),

        }),

      }
    );



    router.refresh();


    setSaving(false);

  }





  return (

    <div className="space-y-8">


      <h2 className="text-2xl font-bold text-white">
        Dimensionamento Solar
      </h2>




      <div className="grid grid-cols-2 gap-6">


<div>

<label className="mb-2 block text-sm text-zinc-400">
Tipo de instalação
</label>


<select

name="systemType"

value={form.systemType}

onChange={change}

className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"

>

<option value="RESIDENCIAL">
Residencial
</option>


<option value="COMERCIAL">
Comercial
</option>


<option value="INDUSTRIAL">
Industrial
</option>


<option value="RURAL">
Rural
</option>


<option value="USINA SOLO">
Usina Solo
</option>


</select>


</div>


        {[
          ["monthlyConsumption","Consumo mensal kWh"],
          ["solarIrradiation","Irradiação média"],
          ["lossFactor","Perdas %"],
          ["modulePower","Potência módulo W"],
          ["moduleQuantity","Quantidade módulos"],
          ["installedPower","Potência kWp"],
          ["estimatedGeneration","Geração estimada kWh"],
          ["requiredArea","Área necessária m²"],
          ["systemValue","Valor do sistema R$"],
          ["energyTariff","Tarifa R$/kWh"],
        ].map(([name,label])=>(


          <div key={name}>

            <label className="mb-2 block text-sm text-zinc-400">
              {label}
            </label>


            <input

              name={name}

              value={
                form[
                  name as keyof typeof form
                ]
              }

              onChange={change}

              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"

            />

          </div>


        ))}


      </div>





      <div className="grid grid-cols-4 gap-5">


        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

          <p className="text-sm text-zinc-400">
            Economia mensal
          </p>

          <h3 className="mt-2 text-2xl font-bold text-orange-500">
            R$ {form.monthlySaving}
          </h3>

        </div>


<div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

  <p className="text-sm text-zinc-400">
    Cobertura do consumo
  </p>

  <h3 className="mt-2 text-2xl font-bold text-orange-500">
    {form.coveragePercent}%
  </h3>

</div>



        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

          <p className="text-sm text-zinc-400">
            Economia anual
          </p>

          <h3 className="mt-2 text-2xl font-bold text-orange-500">
            R$ {form.annualSaving}
          </h3>

        </div>




        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

          <p className="text-sm text-zinc-400">
            Payback
          </p>

          <h3 className="mt-2 text-2xl font-bold text-orange-500">
            {form.paybackYears} anos
          </h3>

        </div>


          </div>

  





     <div className="flex gap-4">

  <button
    onClick={calculate}
    className="rounded-xl bg-zinc-800 px-6 py-3 font-bold text-white"
  >
    Calcular
  </button>

  <button
    onClick={save}
    disabled={saving}
    className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white"
  >
    {saving
      ? "Salvando..."
      : "Salvar Dimensionamento"}
  </button>

  <button
    onClick={async () => {

      await save();

      const response = await fetch(
        "/api/proposals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
            title: "Proposta Solar",
            amount: Number(form.systemValue),
            systemPower: Number(form.installedPower),
            monthlySaving: Number(form.monthlySaving),
            annualSaving: Number(form.annualSaving),
            payback: Number(form.paybackYears),
          }),
        }
      );

      if (!response.ok) {
        alert("Erro ao gerar proposta.");
        return;
      }

      alert("Proposta gerada com sucesso.");

      router.refresh();

    }}
    className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
  >
    Gerar Proposta
  </button>

    </div>

</div>

);

}
    