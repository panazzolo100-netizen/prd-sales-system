import { NextResponse } from "next/server";

import {
  listCompanyClients,
  updateCompanyClient,
} from "@/services/clients.service";

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