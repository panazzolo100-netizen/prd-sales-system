import { NextResponse } from "next/server";

import {
  getLeadEngineering,
  saveLeadEngineering,
} from "@/services/engineering.service";



export async function GET(request: Request) {

  try {

    const { searchParams } = new URL(request.url);


    const leadId = searchParams.get("leadId");


    if (!leadId) {

      return NextResponse.json(
        {
          error: "Lead obrigatório.",
        },
        {
          status:400,
        }
      );

    }



    const engineering =
      await getLeadEngineering(leadId);



    console.log(
      "BUSCANDO ENGENHARIA:",
      leadId,
      engineering
    );



    return NextResponse.json(
      engineering
    );


  } catch(error) {


    console.error(
      "ERRO AO BUSCAR ENGENHARIA:",
      error
    );


    return NextResponse.json(
      {
        error:"Erro ao buscar engenharia."
      },
      {
        status:500,
      }
    );

  }

}




export async function POST(
  request: Request
) {


  try {


    const body = await request.json();



    console.log(
      "RECEBENDO ENGENHARIA:",
      body
    );



    if(!body.leadId){

      return NextResponse.json(
        {
          error:"Lead obrigatório."
        },
        {
          status:400
        }
      );

    }



    const engineering =
      await saveLeadEngineering(
        body.leadId,
        {

          // SISTEMA

          systemType:
            body.systemType ?? null,


          installedPower:
            body.installedPower !== null &&
            body.installedPower !== undefined
              ? Number(body.installedPower)
              : null,


          modules:
            body.modules !== null &&
            body.modules !== undefined
              ? Number(body.modules)
              : null,


          modulePower:
            body.modulePower !== null &&
            body.modulePower !== undefined
              ? Number(body.modulePower)
              : null,


          moduleBrand:
            body.moduleBrand ?? null,


          inverter:
            body.inverter ?? null,



          // UNIDADE CONSUMIDORA


          distributor:
            body.distributor ?? null,


          consumerUnit:
            body.consumerUnit ?? null,


          tariffGroup:
            body.tariffGroup ?? null,


          consumerClass:
            body.consumerClass ?? null,


          contractedDemand:
            body.contractedDemand !== null &&
            body.contractedDemand !== undefined
              ? Number(body.contractedDemand)
              : null,


          measuredDemand:
            body.measuredDemand !== null &&
            body.measuredDemand !== undefined
              ? Number(body.measuredDemand)
              : null,



          // TELHADO


          roofType:
            body.roofType ?? null,


          roofArea:
            body.roofArea !== null &&
            body.roofArea !== undefined
              ? Number(body.roofArea)
              : null,


          roofOrientation:
            body.roofOrientation ?? null,


          roofSlope:
            body.roofSlope !== null &&
            body.roofSlope !== undefined
              ? Number(body.roofSlope)
              : null,


          shading:
            body.shading ?? null,


          structureType:
            body.structureType ?? null,



          // ELÉTRICA


          voltage:
            body.voltage ?? null,


          phase:
            body.phase ?? null,



          notes:
            body.notes ?? null,

        }
      );



    console.log(
      "SALVOU ENGENHARIA:",
      engineering
    );



    return NextResponse.json(
      engineering,
      {
        status:201,
      }
    );


  } catch(error){


    console.error(
      "ERRO AO SALVAR ENGENHARIA:",
      error
    );



    return NextResponse.json(
      {
        error:"Erro ao salvar engenharia."
      },
      {
        status:500,
      }
    );

  }

}