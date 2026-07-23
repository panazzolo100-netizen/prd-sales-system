import { NextResponse } from "next/server";

import { deleteCompanyFinancial } from "@/services/financial.service";

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Registro financeiro obrigatório." },
        { status: 400 }
      );
    }

    await deleteCompanyFinancial(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir registro financeiro.";
    return NextResponse.json(
      { error: message },
      {
        status: message.includes("não encontrado")
          ? 404
          : message.includes("não pode") ||
              message.includes("mudou")
            ? 409
            : 500,
      }
    );
  }
}
