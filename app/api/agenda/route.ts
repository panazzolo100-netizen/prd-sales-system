import { NextResponse } from "next/server";

import { deleteCompanyAgendaItem } from "@/services/agenda.service";

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        {
          error: "Agendamento obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    await deleteCompanyAgendaItem(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao remover agendamento.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: message.includes("não encontrado")
          ? 404
          : 500,
      }
    );
  }
}
