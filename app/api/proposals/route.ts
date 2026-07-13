import { NextResponse } from "next/server";

import {
  getProposal,
  saveProposal,
} from "@/services/proposals.service";

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
          status: 400,
        }
      );
    }

    const proposal = await getProposal(
      leadId
    );

    return NextResponse.json(
      proposal
    );

  } catch (error) {

    console.error(
      "ERRO AO BUSCAR PROPOSTA:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro ao buscar proposta.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {

    const body =
      await request.json();

    if (!body.leadId) {

      return NextResponse.json(
        {
          error: "Lead obrigatório.",
        },
        {
          status: 400,
        }
      );

    }

    const proposal =
      await saveProposal(
        body.leadId,
        {
          title:
            body.title ??
            "Proposta Solar",

          amount:
            Number(body.amount ?? 0),

          status:
            body.status ??
            "RASCUNHO",

          validUntil:
            body.validUntil
              ? new Date(body.validUntil)
              : null,

          systemPower:
            body.systemPower,

          monthlySaving:
            body.monthlySaving,

          annualSaving:
            body.annualSaving,

          payback:
            body.payback,
        }
      );

    return NextResponse.json(
      proposal,
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "ERRO AO SALVAR PROPOSTA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao salvar proposta.",
      },
      {
        status: 500,
      }
    );
  }
}