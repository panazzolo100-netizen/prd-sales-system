import { NextRequest, NextResponse } from "next/server";

import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  getFinancialAttachmentAccess,
  removeFinancialAttachment,
  uploadFinancialAttachment,
} from "@/services/financial-attachments.service";

function attachmentErrorResponse(error: unknown, fallback: string) {
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
  const safeMessages = new Set(["Financeiro não encontrado.", "Anexo não encontrado."]);
  return NextResponse.json(
    { error: safeMessages.has(message) ? message : fallback },
    { status: message.endsWith("não encontrado.") ? 404 : 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Anexo obrigatório." }, { status: 400 });
    }
    const accessUrl = await getFinancialAttachmentAccess(id);
    return NextResponse.redirect(new URL(accessUrl, request.url));
  } catch (error) {
    return attachmentErrorResponse(error, "Erro ao acessar anexo.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const financialId = String(formData.get("financialId") ?? "").trim();
    const type = String(formData.get("type") ?? "COMPROVANTE").trim();
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }
    if (!financialId) {
      return NextResponse.json({ error: "Financeiro obrigatório." }, { status: 400 });
    }
    const attachment = await uploadFinancialAttachment({
      financialId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
      type,
    });
    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    return attachmentErrorResponse(error, "Erro ao enviar anexo.");
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
      return NextResponse.json({ error: "Anexo obrigatório." }, { status: 400 });
    }
    const attachment = await removeFinancialAttachment(id);
    return NextResponse.json({ success: true, id: attachment.id });
  } catch (error) {
    return attachmentErrorResponse(error, "Erro ao excluir anexo.");
  }
}
