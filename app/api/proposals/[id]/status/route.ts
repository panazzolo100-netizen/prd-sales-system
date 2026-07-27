import { NextResponse } from "next/server";
import { accessErrorResponse } from "@/lib/api/access-response";
import { changeProposalStatus } from "@/services/proposals.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (typeof body.status !== "string") return NextResponse.json({ error: "Status obrigatório." }, { status: 400 });
    const proposal = await changeProposalStatus(id, body.status, body.expectedUpdatedAt ? new Date(body.expectedUpdatedAt) : undefined);
    return NextResponse.json(proposal);
  } catch (error) {
    const access = accessErrorResponse(error); if (access) return access;
    const message = error instanceof Error ? error.message : "Erro ao atualizar proposta.";
    return NextResponse.json({ error: message === "CONFLICT" ? "A proposta foi alterada em outra sessão. Atualize a página." : message }, { status: message === "CONFLICT" ? 409 : message.includes("não encontrada") ? 404 : 400 });
  }
}
