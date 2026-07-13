import { NextResponse } from "next/server";
import { createLeadActivity } from "@/repositories/leads.repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.leadId) {
      return NextResponse.json(
        { error: "Lead obrigatório." },
        { status: 400 }
      );
    }

    if (!body.title) {
      return NextResponse.json(
        { error: "Título obrigatório." },
        { status: 400 }
      );
    }

    const activity = await createLeadActivity({
      leadId: body.leadId,
      type: body.type ?? "MANUAL",
      title: body.title,
      notes: body.notes ?? null,
    });

    return NextResponse.json(activity, {
      status: 201,
    });
  } catch (error) {
    console.error("ERRO AO CRIAR ATIVIDADE:", error);

    return NextResponse.json(
      {
        error: "Erro ao criar atividade.",
      },
      {
        status: 500,
      }
    );
  }
}