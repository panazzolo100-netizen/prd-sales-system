import { NextResponse } from "next/server";
import { accessErrorResponse } from "@/lib/api/access-response";
import { changeEngineeringStatus } from "@/services/engineering.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (typeof body.status !== "string") return NextResponse.json({ error: "Status obrigatório." }, { status: 400 });
    const project = await changeEngineeringStatus(id, body.status, body.expectedUpdatedAt ? new Date(body.expectedUpdatedAt) : undefined);
    return NextResponse.json(project);
  } catch (error) {
    const access = accessErrorResponse(error); if (access) return access;
    const message = error instanceof Error ? error.message : "Erro ao atualizar engenharia.";
    return NextResponse.json({ error: message === "CONFLICT" ? "O registro foi alterado em outra sessão. Atualize a página." : message }, { status: message === "CONFLICT" ? 409 : message.includes("não encontrado") ? 404 : 400 });
  }
}
