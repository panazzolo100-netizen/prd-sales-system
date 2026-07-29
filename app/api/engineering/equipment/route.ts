import { NextRequest, NextResponse } from "next/server";

import {
  createEngineeringEquipment,
  listEngineeringEquipments,
  removeEngineeringEquipment,
  updateEngineeringEquipment,
  type SaveEngineeringEquipmentInput,
} from "@/services/engineering.service";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const clientMessages = new Set([
    "Projeto não encontrado.",
    "Equipamento não encontrado.",
    "Tipo do equipamento é obrigatório.",
    "Quantidade deve ser um número inteiro maior que zero.",
    "Potência inválido.",
    "Tensão inválido.",
    "Corrente inválido.",
    "Quantidade de MPPT inválido.",
    "Quantidade de MPPT deve ser um número inteiro.",
    "Eficiência inválido.",
    "Eficiência deve estar entre 0 e 100%.",
    "Peso inválido.",
    "Posição inválido.",
    "Potência não pode ser negativa.",
    "Tensão não pode ser negativa.",
    "Corrente não pode ser negativa.",
    "MPPT não pode ser negativo.",
    "Peso não pode ser negativo.",
    "Posição não pode ser negativa.",
  ]);

  const isNotFound = message.endsWith("não encontrado.");

  return NextResponse.json(
    {
      error:
        clientMessages.has(message) || isNotFound
          ? message
          : fallback,
    },
    {
      status: isNotFound
        ? 404
        : clientMessages.has(message)
          ? 400
          : 500,
    }
  );
}

function getRequestObject(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return body as Record<string, unknown>;
}

function toEquipmentInput(
  input: Record<string, unknown>
): SaveEngineeringEquipmentInput {
  return {
    type: input.type,
    manufacturer: input.manufacturer,
    model: input.model,
    description: input.description,
    quantity: input.quantity,
    power: input.power,
    unit: input.unit,
    voltage: input.voltage,
    current: input.current,
    mppt: input.mppt,
    efficiency: input.efficiency,
    dimensions: input.dimensions,
    weight: input.weight,
    notes: input.notes,
    position: input.position,
  };
}

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

    const equipments = await listEngineeringEquipments(projectId);

    return NextResponse.json(equipments);
  } catch (error) {
    return errorResponse(error, "Erro ao listar equipamentos.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = getRequestObject(body);

    if (!input) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const projectId = String(input.projectId ?? "").trim();

    if (!projectId) {
      return NextResponse.json(
        { error: "Projeto obrigatório." },
        { status: 400 }
      );
    }

    const equipment = await createEngineeringEquipment(
      projectId,
      toEquipmentInput(input)
    );

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Erro ao adicionar equipamento.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = getRequestObject(body);

    if (!input) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const projectId = String(input.projectId ?? "").trim();
    const id = String(input.id ?? "").trim();

    if (!projectId || !id) {
      return NextResponse.json(
        { error: "Projeto e equipamento são obrigatórios." },
        { status: 400 }
      );
    }

    const equipment = await updateEngineeringEquipment(
      projectId,
      id,
      toEquipmentInput(input)
    );

    return NextResponse.json(equipment);
  } catch (error) {
    return errorResponse(error, "Erro ao atualizar equipamento.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams
      .get("projectId")
      ?.trim();
    const id = request.nextUrl.searchParams.get("id")?.trim();

    if (!projectId || !id) {
      return NextResponse.json(
        { error: "Projeto e equipamento são obrigatórios." },
        { status: 400 }
      );
    }

    const equipment = await removeEngineeringEquipment(projectId, id);

    return NextResponse.json({ id: equipment.id });
  } catch (error) {
    return errorResponse(error, "Erro ao excluir equipamento.");
  }
}