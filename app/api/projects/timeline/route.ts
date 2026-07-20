import { NextRequest, NextResponse } from "next/server";

import { listCompanyProjectTimeline } from "@/services/project-timeline.service";

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams
      .get("projectId")
      ?.trim();

    if (!projectId) {
      return NextResponse.json(
        { error: "Projeto obrigatório." },
        { status: 400 }
      );
    }

    const timeline = await listCompanyProjectTimeline(projectId);

    return NextResponse.json(timeline);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar histórico do projeto.";

    return NextResponse.json(
      { error: message },
      { status: message === "Projeto não encontrado." ? 404 : 500 }
    );
  }
}
