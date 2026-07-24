import { NextRequest, NextResponse } from "next/server";

import { accessErrorResponse } from "@/lib/api/access-response";
import { resolveServiceOrderSignature } from "@/services/service-order-signatures.service";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Ordem de Serviço inválida." }, { status: 400 });
    }
    const result = await resolveServiceOrderSignature(id, "client");
    if (result.type === "redirect") {
      return NextResponse.redirect(new URL(result.url, request.url));
    }
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: { "Content-Type": result.mimeType, "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 404 });
  }
}
