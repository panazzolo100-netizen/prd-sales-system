import { NextResponse } from "next/server";

import {
  getProposal,
  saveProposal,
} from "@/services/proposals.service";



export async function GET(
  request: Request
) {

  try {


    const { searchParams } =
      new URL(request.url);


    const leadId =
      searchParams.get("leadId");


    if(!leadId){

      return NextResponse.json(
        {
          error:
          "Lead não informado"
        },
        {
          status:400
        }
      );

    }



    const proposal =
      await getProposal(
        leadId
      );



    return NextResponse.json(
      proposal
    );


  } catch(error){


    console.error(
      "ERRO AO BUSCAR PROPOSTA:",
      error
    );


    return NextResponse.json(
      {
        error:
        "Erro ao buscar proposta"
      },
      {
        status:500
      }
    );


  }

}





export async function POST(
  request: Request
){

  try {


    const body =
      await request.json();



    const {
      leadId,
      ...data
    } = body;



    if(!leadId){

      return NextResponse.json(
        {
          error:
          "Lead não informado"
        },
        {
          status:400
        }
      );

    }



    const proposal =
      await saveProposal(
        leadId,
        data
      );

      console.log(
  "PROPOSTA CRIADA:",
  proposal
);



    return NextResponse.json(
      proposal,
      {
        status:201
      }
    );



  } catch(error){


    console.error(
      "ERRO AO SALVAR PROPOSTA:",
      error
    );


    return NextResponse.json(
      {
        error:
        "Erro ao salvar proposta"
      },
      {
        status:500
      }
    );

  }

}