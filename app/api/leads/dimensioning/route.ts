import { NextResponse } from "next/server";

import {
  getLeadDimensioning,
  saveLeadDimensioning,
} from "@/services/dimensioning.service";



export async function GET(
  request: Request
) {

  try {

    const { searchParams } =
      new URL(request.url);


    const leadId =
      searchParams.get("leadId");


    if (!leadId) {

      return NextResponse.json(
        {
          error: "Lead obrigatório.",
        },
        {
          status: 400,
        }
      );

    }



    const dimensioning =
      await getLeadDimensioning(
        leadId
      );


    console.log(
      "BUSCANDO DIMENSIONAMENTO:",
      leadId,
      dimensioning
    );


    return NextResponse.json(
      dimensioning
    );



  } catch(error) {


    console.error(
      "ERRO AO BUSCAR DIMENSIONAMENTO:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Erro ao buscar dimensionamento.",
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


    const body =
      await request.json();



    console.log(
      "RECEBENDO DIMENSIONAMENTO:",
      body
    );



    if(!body.leadId){

      return NextResponse.json(
        {
          error:"Lead obrigatório.",
        },
        {
          status:400,
        }
      );

    }



    const dimensioning =
      await saveLeadDimensioning(
        body.leadId,
        {


          monthlyConsumption:
            body.monthlyConsumption != null
              ? Number(body.monthlyConsumption)
              : null,


          solarIrradiation:
            body.solarIrradiation != null
              ? Number(body.solarIrradiation)
              : null,


          lossFactor:
            body.lossFactor != null
              ? Number(body.lossFactor)
              : null,



          modulePower:
            body.modulePower != null
              ? Number(body.modulePower)
              : null,


          moduleQuantity:
            body.moduleQuantity != null
              ? Number(body.moduleQuantity)
              : null,



          installedPower:
            body.installedPower != null
              ? Number(body.installedPower)
              : null,


          estimatedGeneration:
            body.estimatedGeneration != null
              ? Number(body.estimatedGeneration)
              : null,


          requiredArea:
            body.requiredArea != null
              ? Number(body.requiredArea)
              : null,



          estimatedSaving:
            body.estimatedSaving != null
              ? Number(body.estimatedSaving)
              : null,



          // FINANCEIRO

          systemValue:
            body.systemValue != null
              ? Number(body.systemValue)
              : null,


          energyTariff:
            body.energyTariff != null
              ? Number(body.energyTariff)
              : null,


          monthlySaving:
            body.monthlySaving != null
              ? Number(body.monthlySaving)
              : null,


          annualSaving:
            body.annualSaving != null
              ? Number(body.annualSaving)
              : null,


          paybackYears:
            body.paybackYears != null
              ? Number(body.paybackYears)
              : null,

        }
      );



    console.log(
      "SALVOU DIMENSIONAMENTO:",
      dimensioning
    );



    return NextResponse.json(
      dimensioning,
      {
        status:201,
      }
    );



  } catch(error) {


    console.error(
      "ERRO AO SALVAR DIMENSIONAMENTO:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Erro ao salvar dimensionamento.",
      },
      {
        status:500,
      }
    );

  }

}