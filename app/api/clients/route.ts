import { NextResponse } from "next/server";

import {
  deleteCompanyClient,
  listCompanyClients,
  updateCompanyClient,
} from "@/services/clients.service";

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Cliente obrigatório." },
        { status: 400 }
      );
    }

    await deleteCompanyClient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir cliente.";
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

export async function GET() {
  try {
    const clients =
      await listCompanyClients();

    return NextResponse.json(
      clients
    );
  } catch (error) {
    console.error(
      "ERRO AO BUSCAR CLIENTES:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao buscar clientes.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          error:
            "Cliente obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const client =
      await updateCompanyClient(
        body.id,
        {
          name: body.name,
          document: body.document,
          phone: body.phone,
          email: body.email,
          city: body.city,
          state: body.state,
          address: body.address,
        }
      );

    return NextResponse.json(
      client
    );
  } catch (error) {
    console.error(
      "ERRO AO SALVAR CLIENTE:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao salvar cliente.",
      },
      {
        status: 500,
      }
    );
  }
}
