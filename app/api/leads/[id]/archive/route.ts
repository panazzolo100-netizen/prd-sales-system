import { NextResponse } from "next/server";

import { accessErrorResponse } from "@/lib/api/access-response";
import { archiveCompanyLead } from "@/services/leads.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const lead = await archiveCompanyLead(id);
    return NextResponse.json(lead);
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao arquivar oportunidade.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
