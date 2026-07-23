import { NextResponse } from "next/server";

import { getCurrentCompanyId } from "@/lib/auth/current-user";

import {
  createServiceOrderData,
  updateServiceOrderData,
  updateServiceOrderSignaturesData,
} from "@/services/service-orders.service";

function nullableString(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text = String(value).trim();

  return text.length > 0
    ? text
    : null;
}

function nullableDate(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date = new Date(
    String(value)
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Data inválida."
    );
  }

  return date;
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

    const action = String(
      body.action ?? ""
    )
      .trim()
      .toUpperCase();

    if (!action) {
      return NextResponse.json(
        {
          error: "Ação obrigatória.",
        },
        {
          status: 400,
        }
      );
    }

    if (action === "CREATE") {
      const projectId = String(
        body.projectId ?? ""
      ).trim();

      const title = String(
        body.title ?? ""
      ).trim();

      if (!projectId || !title) {
        return NextResponse.json(
          {
            error:
              "Projeto e título são obrigatórios.",
          },
          {
            status: 400,
          }
        );
      }

      const companyId =
        await getCurrentCompanyId();

      const serviceOrder =
        await createServiceOrderData({
          projectId,
          companyId,
          title,

          responsible:
            nullableString(
              body.responsible
            ),

          scheduledDate:
            nullableDate(
              body.scheduledDate
            ),

          services:
            nullableString(
              body.services
            ),
        });

      return NextResponse.json(
        serviceOrder,
        {
          status: 201,
        }
      );
    }

    if (action === "UPDATE") {
      const id = String(
        body.id ?? ""
      ).trim();

      const status = String(
        body.status ?? ""
      ).trim();

      if (!id || !status) {
        return NextResponse.json(
          {
            error:
              "OS e status são obrigatórios.",
          },
          {
            status: 400,
          }
        );
      }

      const serviceOrder =
        await updateServiceOrderData({
          id,
          status,

          responsible:
            nullableString(
              body.responsible
            ),

          team:
            nullableString(
              body.team
            ),

          scheduledDate:
            nullableDate(
              body.scheduledDate
            ),

          services:
            nullableString(
              body.services
            ),

          materials:
            nullableString(
              body.materials
            ),

          notes:
            nullableString(
              body.notes
            ),
        });

      return NextResponse.json(
        serviceOrder,
        {
          status: 200,
        }
      );
    }

    if (action === "UPDATE_SIGNATURES") {
      const id = String(
        body.id ?? ""
      ).trim();

      if (!id) {
        return NextResponse.json(
          {
            error:
              "Ordem de Serviço obrigatória.",
          },
          {
            status: 400,
          }
        );
      }

      const serviceOrder =
        await updateServiceOrderSignaturesData(
          {
            id,

            customerName:
              nullableString(
                body.customerName
              ),

            customerDocument:
              nullableString(
                body.customerDocument
              ),

            customerSignature:
              body.customerSignature === undefined
                ? undefined
                : nullableString(body.customerSignature),

            technicianName:
              nullableString(
                body.technicianName
              ),

            technicianSignature:
              body.technicianSignature === undefined
                ? undefined
                : nullableString(body.technicianSignature),
          }
        );

      return NextResponse.json(
        serviceOrder,
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Ação inválida.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "ERRO NA ORDEM DE SERVIÇO:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao processar Ordem de Serviço.",
      },
      {
        status: 500,
      }
    );
  }
}
