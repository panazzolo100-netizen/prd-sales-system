import { NextRequest, NextResponse } from "next/server";

import { ProjectDocumentType } from "@/lib/generated/prisma/enums";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  getProjectDocumentAccess,
  listLeadProjectDocuments,
  listProjectDocuments,
  removeProjectDocument,
  setProjectDocumentFavorite,
  uploadLeadProjectDocument,
  uploadProjectDocument,
} from "@/services/project-documents.service";

const PROJECT_DOCUMENT_TYPES = Object.values(ProjectDocumentType);

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
      {
        status: invalidCodes.has(error.code)
          ? 400
          : error.code === "FILE_NOT_FOUND"
            ? 404
            : 502,
      }
    );
  }

  const message = error instanceof Error ? error.message : fallback;
  const safeMessages = new Set([
    "Projeto não encontrado.",
    "Oportunidade não encontrada.",
    "Documento não encontrado.",
  ]);

  return NextResponse.json(
    { error: safeMessages.has(message) ? message : fallback },
    { status: message.endsWith("não encontrado.") ? 404 : 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    const projectId = request.nextUrl.searchParams.get("projectId")?.trim();
    const leadId = request.nextUrl.searchParams.get("leadId")?.trim();

    if (id) {
      const accessUrl = await getProjectDocumentAccess(id);
      return NextResponse.redirect(new URL(accessUrl, request.url));
    }

    if (leadId) {
      return NextResponse.json(await listLeadProjectDocuments(leadId));
    }

    if (projectId) {
      return NextResponse.json(await listProjectDocuments(projectId));
    }

    return NextResponse.json(
      { error: "Documento, projeto ou oportunidade obrigatórios." },
      { status: 400 }
    );
  } catch (error) {
    return storageErrorResponse(error, "Erro ao acessar documentos.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const projectId = String(formData.get("projectId") ?? "").trim();
    const leadId = String(formData.get("leadId") ?? "").trim();
    const type = String(
      formData.get("type") ?? ""
    ).trim() as ProjectDocumentType;
    const notes = String(formData.get("notes") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo inválido." },
        { status: 400 }
      );
    }

    if (!projectId && !leadId) {
      return NextResponse.json(
        { error: "Projeto ou oportunidade obrigatórios." },
        { status: 400 }
      );
    }

    if (projectId && leadId) {
      return NextResponse.json(
        { error: "Informe somente o projeto ou a oportunidade." },
        { status: 400 }
      );
    }

    if (!PROJECT_DOCUMENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Categoria de documento inválida." },
        { status: 400 }
      );
    }

    const uploadInput = {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
      type,
      notes: notes || null,
    };

    const document = leadId
      ? await uploadLeadProjectDocument({ leadId, ...uploadInput })
      : await uploadProjectDocument({ projectId, ...uploadInput });

    return NextResponse.json(document);
  } catch (error) {
    return storageErrorResponse(error, "Erro ao enviar documento.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
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
      await setProjectDocumentFavorite({
        id,
        isFavorite: input.isFavorite,
      })
    );
  } catch (error) {
    return storageErrorResponse(error, "Erro ao atualizar documento.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Documento obrigatório." },
        { status: 400 }
      );
    }

    const document = await removeProjectDocument(id);
    return NextResponse.json({ id: document.id });
  } catch (error) {
    return storageErrorResponse(error, "Erro ao excluir documento.");
  }
}
