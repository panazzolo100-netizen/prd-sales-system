import { NextRequest, NextResponse } from "next/server";

import { getCompanyServiceOrderDashboard } from "@/services/service-orders.service";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Ordem de Serviço obrigatória." },
        { status: 400 }
      );
    }

    const dashboard = await getCompanyServiceOrderDashboard(id);

    return NextResponse.json(dashboard);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar painel da Ordem de Serviço.";

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "Ordem de Serviço não encontrada." ? 404 : 500,
      }
    );
  }
}
