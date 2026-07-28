import { NextResponse } from "next/server";

import { accessErrorResponse } from "@/lib/api/access-response";
import {
  deleteCompanyLead,
  getCompanyLeadById,
} from "@/services/leads.service";

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

export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { confirmationText?: unknown };
    const confirmationText =
      typeof body.confirmationText === "string" ? body.confirmationText : "";

    const result = await deleteCompanyLead(id, confirmationText);
    return NextResponse.json(result);
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível excluir a oportunidade.";
    const status = message.includes("não encontrado")
      ? 404
      : message.includes("não pode ser excluída")
        ? 409
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
