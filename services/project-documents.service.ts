import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
async function getCurrentAppUser() {
  return requirePermission(PERMISSIONS.PROJECTS);
}
import { ProjectDocumentType } from "@/lib/generated/prisma/enums";
import { removeStoredProjectDocument } from "@/lib/project-document-storage";
import {
  PROJECT_DOCUMENT_ALLOWED_MIME_TYPES,
} from "@/lib/storage/storage.config";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  createPrivateFileSignedUrl,
  deletePrivateFile,
  uploadPrivateFile,
} from "@/lib/storage/private-storage.service";
import { parseStoredFileLocation } from "@/lib/storage/storage-reference";
import {
  createProjectDocument,
  deleteProjectDocument,
  findCompanyProjectDocumentById,
  findCompanyProjectForDocuments,
  findProjectDocuments,
  updateProjectDocumentFavorite,
} from "@/repositories/project-documents.repository";
import { registerProjectEvent } from "@/services/project-timeline.service";

type ProjectDocumentRecord = {
  id: string;
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: ProjectDocumentType;
  notes: string | null;
  isFavorite: boolean;
  uploadedById: string | null;
  uploadedBy: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

async function resolveDocumentAccessUrl(document: ProjectDocumentRecord, companyId: string) {
  const location = parseStoredFileLocation(document.url);
  if (location.type === "legacy-local" || location.type === "external") {
    return location.url;
  }
  if (location.type !== "supabase") return null;
  try {
    const result = await createPrivateFileSignedUrl({
      companyId,
      reference: document.url,
    });
    return result.url;
  } catch {
    return null;
  }
}

export async function toProjectDocumentResponse(
  document: ProjectDocumentRecord,
  companyId: string
) {
  const accessUrl = await resolveDocumentAccessUrl(document, companyId);
  const { url, ...publicDocument } = document;
  return { ...publicDocument, storageReference: url, accessUrl };
}

export async function toProjectDocumentResponses(
  documents: ProjectDocumentRecord[],
  companyId: string
) {
  return Promise.all(documents.map((document) => toProjectDocumentResponse(document, companyId)));
}

export async function listProjectDocuments(projectId: string) {
  const user = await getCurrentAppUser();
  const project = await findCompanyProjectForDocuments(projectId, user.companyId);
  if (!project) throw new Error("Projeto não encontrado.");
  return toProjectDocumentResponses(
    await findProjectDocuments(projectId, user.companyId),
    user.companyId
  );
}

export async function getProjectDocumentAccess(id: string) {
  const user = await getCurrentAppUser();
  const document = await findCompanyProjectDocumentById(id, user.companyId);
  if (!document) throw new Error("Documento não encontrado.");
  const location = parseStoredFileLocation(document.url);
  if (location.type === "legacy-local" || location.type === "external") {
    return location.url;
  }
  if (location.type !== "supabase") {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o documento é inválida."
    );
  }
  const result = await createPrivateFileSignedUrl({
    companyId: user.companyId,
    reference: document.url,
  });
  return result.url;
}

export async function uploadProjectDocument(data: {
  projectId: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  type: ProjectDocumentType;
  notes?: string | null;
}) {
  const user = await getCurrentAppUser();
  const project = await findCompanyProjectForDocuments(data.projectId, user.companyId);
  if (!project) throw new Error("Projeto não encontrado.");
  if (!(PROJECT_DOCUMENT_ALLOWED_MIME_TYPES as readonly string[]).includes(data.mimeType)) {
    throw new PrivateStorageError(
      "FILE_TYPE_NOT_ALLOWED",
      "O tipo do documento não é permitido."
    );
  }

  const storedFile = await uploadPrivateFile({
    companyId: user.companyId,
    scope: "project-document",
    entityId: data.projectId,
    originalName: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
  });

  let document: ProjectDocumentRecord;
  try {
    document = await createProjectDocument({
      projectId: data.projectId,
      name: data.name,
      url: storedFile.reference,
      mimeType: data.mimeType,
      size: data.size,
      type: data.type,
      notes: data.notes,
      uploadedById: user.id,
    });
  } catch (persistenceError) {
    try {
      await deletePrivateFile({
        companyId: user.companyId,
        referenceOrPath: storedFile.reference,
      });
    } catch (compensationError) {
      console.error("Falha ao compensar upload de documento de projeto.", {
        storageCode:
          compensationError instanceof PrivateStorageError
            ? compensationError.code
            : "UNKNOWN",
      });
      throw new Error(
        "Não foi possível salvar o documento nem concluir a compensação do arquivo.",
        { cause: new AggregateError([persistenceError, compensationError]) }
      );
    }
    throw persistenceError;
  }

  await registerProjectEvent({
    projectId: data.projectId,
    type: "DOCUMENT_UPLOADED",
    title: "Documento enviado",
    description: `${data.name} foi adicionado ao projeto.`,
  });
  return toProjectDocumentResponse(document, user.companyId);
}

export async function removeProjectDocument(id: string) {
  const user = await getCurrentAppUser();
  const document = await findCompanyProjectDocumentById(id, user.companyId);
  if (!document) throw new Error("Documento não encontrado.");

  const location = parseStoredFileLocation(document.url);
  if (location.type === "supabase") {
    try {
      await deletePrivateFile({
        companyId: user.companyId,
        referenceOrPath: document.url,
      });
    } catch (error) {
      if (!(error instanceof PrivateStorageError) || error.code !== "FILE_NOT_FOUND") {
        throw error;
      }
    }
  } else if (location.type === "legacy-local") {
    await removeStoredProjectDocument({ projectId: document.projectId, url: document.url });
  } else if (location.type === "invalid") {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o documento é inválida."
    );
  }
  // URLs HTTP/HTTPS são externas; somente o registro interno é removido.
  await deleteProjectDocument(id);
  await registerProjectEvent({
    projectId: document.projectId,
    type: "DOCUMENT_DELETED",
    title: "Documento removido",
    description: `${document.name} (${document.type.replaceAll("_", " ")}) foi removido do projeto.`,
  });
  return document;
}

export async function setProjectDocumentFavorite(data: {
  id: string;
  isFavorite: boolean;
}) {
  const user = await getCurrentAppUser();
  const currentDocument = await findCompanyProjectDocumentById(data.id, user.companyId);
  if (!currentDocument) throw new Error("Documento não encontrado.");
  const document = await updateProjectDocumentFavorite(data.id, data.isFavorite);
  if (currentDocument.isFavorite !== data.isFavorite) {
    await registerProjectEvent({
      projectId: currentDocument.projectId,
      type: data.isFavorite ? "DOCUMENT_FAVORITED" : "DOCUMENT_UNFAVORITED",
      title: data.isFavorite ? "Documento favoritado" : "Documento removido dos favoritos",
      description: `${currentDocument.name} ${
        data.isFavorite ? "foi adicionado aos favoritos" : "foi removido dos favoritos"
      } por ${user.name}.`,
    });
  }
  return toProjectDocumentResponse(document, user.companyId);
}
