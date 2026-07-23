import { NextResponse } from "next/server";

import { deleteCompanyLead, getCompanyLeadById } from "@/services/leads.service";

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
  try {
    const { id } = await context.params;
    await deleteCompanyLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir oportunidade.";
    return NextResponse.json({ error: message }, { status: message.includes("vinculado") ? 409 : 400 });
  }
}
