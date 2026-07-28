import { NextResponse } from "next/server";
import { previewProposalExcel } from "@/services/proposal-excel.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { leadId?: string; fileId?: string };
    if (!body.leadId?.trim() || !body.fileId?.trim()) {
      return NextResponse.json({ error: "Lead e arquivo são obrigatórios." }, { status: 400 });
    }
    return NextResponse.json(await previewProposalExcel(body.leadId, body.fileId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao analisar proposta.";
    return NextResponse.json({ error: message }, { status: message.includes("não encontr") ? 404 : 400 });
  }
}
