import { NextRequest, NextResponse } from "next/server";

import { ProjectDocumentType } from "@/lib/generated/prisma/enums";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  getProjectDocumentAccess,
  removeProjectDocument,
  setProjectDocumentFavorite,
  uploadProjectDocument,
} from "@/services/project-documents.service";

const PROJECT_DOCUMENT_TYPES = Object.values(ProjectDocumentType);

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Documento obrigatório." }, { status: 400 });
    }
    const accessUrl = await getProjectDocumentAccess(id);
    return NextResponse.redirect(new URL(accessUrl, request.url));
  } catch (error) {
    return storageErrorResponse(error, "Erro ao acessar documento.");
  }
}

function storageErrorResponse(error: unknown, fallback: string) {
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
  const safeMessages = new Set(["Projeto não encontrado.", "Documento não encontrado."]);
  return NextResponse.json(
    { error: safeMessages.has(message) ? message : fallback },
    { status: message.endsWith("não encontrado.") ? 404 : 500 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const projectId = String(formData.get("projectId") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim() as ProjectDocumentType;
    const notes = String(formData.get("notes") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }
    if (!projectId) {
      return NextResponse.json({ error: "Projeto obrigatório." }, { status: 400 });
    }
    if (!PROJECT_DOCUMENT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Categoria de documento inválida." }, { status: 400 });
    }

    const document = await uploadProjectDocument({
      projectId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
      type,
      notes: notes || null,
    });
    return NextResponse.json(document);
  } catch (error) {
    return storageErrorResponse(error, "Erro ao enviar documento.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const id = String(input.id ?? "").trim();
    if (!id || typeof input.isFavorite !== "boolean") {
      return NextResponse.json(
        { error: "Documento e favorito são obrigatórios." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      await setProjectDocumentFavorite({ id, isFavorite: input.isFavorite })
    );
  } catch (error) {
    return storageErrorResponse(error, "Erro ao atualizar documento.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Documento obrigatório." }, { status: 400 });
    }
    const document = await removeProjectDocument(id);
    return NextResponse.json({ id: document.id });
  } catch (error) {
    return storageErrorResponse(error, "Erro ao excluir documento.");
  }
}
