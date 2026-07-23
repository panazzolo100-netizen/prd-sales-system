import { NextRequest, NextResponse } from "next/server";

import {
  resolveServiceOrderSignature,
  type ServiceOrderSignatureType,
} from "@/services/service-order-signatures.service";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    const type = request.nextUrl.searchParams.get("type")?.trim() as ServiceOrderSignatureType;
    if (!id || (type !== "client" && type !== "technician")) {
      return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
    }
    const result = await resolveServiceOrderSignature(id, type);
    if (result.type === "redirect") {
      return NextResponse.redirect(new URL(result.url, request.url));
    }
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao acessar assinatura.";
    const safe = message.endsWith("não encontrada.") || message === "Ordem de Serviço não encontrada.";
    return NextResponse.json(
      { error: safe ? message : "Erro ao acessar assinatura." },
      { status: safe ? 404 : 500 }
    );
  }
}
