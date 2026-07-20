import { NextResponse } from "next/server";

import {
  updateServiceOrderChecklistData,
} from "@/services/service-orders.service";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

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
      await updateServiceOrderChecklistData(
        id,
        {
          checklistArt:
            Boolean(
              body.checklistArt
            ),

          checklistProjectApproved:
            Boolean(
              body.checklistProjectApproved
            ),

          checklistMaterialsSeparated:
            Boolean(
              body.checklistMaterialsSeparated
            ),

          checklistStructureInstalled:
            Boolean(
              body.checklistStructureInstalled
            ),

          checklistModulesInstalled:
            Boolean(
              body.checklistModulesInstalled
            ),

          checklistInverterInstalled:
            Boolean(
              body.checklistInverterInstalled
            ),

          checklistDcCabling:
            Boolean(
              body.checklistDcCabling
            ),

          checklistAcCabling:
            Boolean(
              body.checklistAcCabling
            ),

          checklistCommissioning:
            Boolean(
              body.checklistCommissioning
            ),

          checklistCustomerTraining:
            Boolean(
              body.checklistCustomerTraining
            ),

          checklistDelivered:
            Boolean(
              body.checklistDelivered
            ),
        }
      );

    return NextResponse.json(
      serviceOrder,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO ATUALIZAR CHECKLIST:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar checklist.",
      },
      {
        status: 500,
      }
    );
  }
}