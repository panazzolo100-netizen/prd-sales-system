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

export async function DELETE(_request: Request, context: Context) {
  await context.params;
  return NextResponse.json(
    { error: "A exclusão física de oportunidades não é permitida. Use o arquivamento." },
    { status: 405, headers: { Allow: "GET" } }
  );
}
