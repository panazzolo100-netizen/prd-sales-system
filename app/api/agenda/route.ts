import { NextResponse } from "next/server";

import {
  createCompanyAgendaEvent,
  deleteCompanyAgendaItem,
  getAgendaData,
  updateCompanyAgendaEvent,
} from "@/services/agenda.service";

function errorResponse(
  error: unknown,
  fallback: string
) {
  const message =
    error instanceof Error
      ? error.message
      : fallback;

  return NextResponse.json(
    {
      error: message,
    },
    {
      status:
        message.includes("não encontrado")
          ? 404
          : message.includes("obrigatório") ||
              message.includes("inválid") ||
              message.includes("anterior")
            ? 400
            : 500,
    }
  );
}

export async function GET() {
  try {
    return NextResponse.json(
      await getAgendaData()
    );
  } catch (error) {
    return errorResponse(
      error,
      "Erro ao carregar agenda."
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const event =
      await createCompanyAgendaEvent(
        body
      );

    return NextResponse.json(
      event,
      {
        status: 201,
      }
    );
  } catch (error) {
    return errorResponse(
      error,
      "Erro ao criar evento."
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const id = String(
      body.id ?? ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          error: "Evento obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const event =
      await updateCompanyAgendaEvent(
        id,
        body
      );

    return NextResponse.json(event);
  } catch (error) {
    return errorResponse(
      error,
      "Erro ao atualizar evento."
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const id = new URL(
      request.url
    ).searchParams
      .get("id")
      ?.trim();

    if (!id) {
      return NextResponse.json(
        {
          error: "Evento obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      await deleteCompanyAgendaItem(id)
    );
  } catch (error) {
    return errorResponse(
      error,
      "Erro ao excluir evento."
    );
  }
}