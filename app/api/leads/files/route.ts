import { NextRequest, NextResponse } from "next/server";

import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  getCompanyLeadFileAccess,
  removeCompanyLeadFile,
  uploadCompanyLeadFile,
} from "@/services/leads.files.service";

function leadFileErrorResponse(error: unknown, fallback: string) {
  if (error instanceof PrivateStorageError) {
    const invalidCodes = new Set([
      "INVALID_FILE",
      "FILE_TYPE_NOT_ALLOWED",
      "FILE_SIZE_EXCEEDED",
      "INVALID_STORAGE_PATH",
    ]);
    return NextResponse.json(
      { error: error.message },
      { status: invalidCodes.has(error.code) ? 400 : error.code === "FILE_NOT_FOUND" ? 404 : 502 }
    );
  }
  const message = error instanceof Error ? error.message : fallback;
  const safeMessages = new Set(["Lead não encontrado.", "Arquivo não encontrado."]);
  return NextResponse.json(
    { error: safeMessages.has(message) ? message : fallback },
    { status: message.endsWith("não encontrado.") ? 404 : 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
    }
    const accessUrl = await getCompanyLeadFileAccess(id);
    return NextResponse.redirect(new URL(accessUrl, request.url));
  } catch (error) {
    return leadFileErrorResponse(error, "Erro ao acessar arquivo.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const leadId = String(formData.get("leadId") ?? "").trim();
    const file = formData.get("file");
    if (!leadId) {
      return NextResponse.json({ error: "ID do Lead é obrigatório." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
    }
    const savedFile = await uploadCompanyLeadFile({
      leadId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
    });
    return NextResponse.json(savedFile, { status: 201 });
  } catch (error) {
    return leadFileErrorResponse(error, "Erro ao enviar arquivo.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const id = String((body as Record<string, unknown>).id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
    }
    const file = await removeCompanyLeadFile(id);
    return NextResponse.json({ success: true, id: file.id });
  } catch (error) {
    return leadFileErrorResponse(error, "Erro ao excluir arquivo.");
  }
}
