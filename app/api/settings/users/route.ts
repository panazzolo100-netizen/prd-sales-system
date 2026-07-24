import { NextResponse } from "next/server";

import { accessErrorResponse } from "@/lib/api/access-response";
import {
  createCompanyUser,
  getUserManagementData,
  removeCompanyUser,
  sendCompanyUserPasswordEmail,
  setCompanyUserActive,
  updateCompanyUser,
} from "@/services/user-management.service";

function errorResponse(error: unknown) {
  const access = accessErrorResponse(error);
  if (access) return access;
  const message = error instanceof Error ? error.message : "Não foi possível concluir a operação.";
  const status =
    message.includes("não encontrado") ? 404 :
    message.includes("Já existe") || message.includes("último executivo") ||
    message.includes("vinculados") || message.includes("próprio") ? 409 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(
      await getUserManagementData({
        search: params.get("search") ?? undefined,
        page: Number(params.get("page") ?? 1),
        pageSize: Number(params.get("pageSize") ?? 10),
      })
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await createCompanyUser(body), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Usuário obrigatório." }, { status: 400 });
    }
    if (body.action === "status") {
      return NextResponse.json(await setCompanyUserActive(body.id, Boolean(body.active)));
    }
    if (body.action === "reset-password" || body.action === "invite") {
      return NextResponse.json(await sendCompanyUserPasswordEmail(body.id));
    }
    return NextResponse.json(await updateCompanyUser(body));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Usuário obrigatório." }, { status: 400 });
    }
    return NextResponse.json(await removeCompanyUser(id));
  } catch (error) {
    return errorResponse(error);
  }
}
