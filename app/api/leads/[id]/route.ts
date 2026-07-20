import { NextResponse } from "next/server";

import { getCompanyLeadById } from "@/services/leads.service";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const lead = await getCompanyLeadById(id);

    return NextResponse.json(lead);
  } catch (error) {
    console.error(
      "ERRO AO BUSCAR LEAD:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro ao buscar lead.",
      },
      {
        status: 500,
      }
    );
  }
}