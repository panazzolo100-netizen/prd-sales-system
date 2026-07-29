import { ProjectDocumentType } from "@/lib/generated/prisma/enums";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { removeStoredProjectDocument } from "@/lib/project-document-storage";
import { PROJECT_DOCUMENT_ALLOWED_MIME_TYPES } from "@/lib/storage/storage.config";
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
  findCompanyLeadForDocuments,
  findCompanyProjectDocumentById,
  findCompanyProjectForDocuments,
  findLeadProjectDocuments,
  findProjectDocuments,
  updateProjectDocumentFavorite,
} from "@/repositories/project-documents.repository";
import { requirePermission } from "@/services/auth.service";
import { registerProjectEvent } from "@/services/project-timeline.service";

async function getCurrentProjectUser() {
  return requirePermission(PERMISSIONS.PROJECTS);
}

async function getCurrentCommercialUser() {
  return requirePermission(PERMISSIONS.COMMERCIAL);
}

type ProjectDocumentRecord = {
  id: string;
  projectId: string | null;
  leadId: string | null;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: ProjectDocumentType;
  notes: string | null;
  isFavorite: boolean;
  uploadedById: string | null;
  uploadedBy: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

async function resolveDocumentAccessUrl(
  document: ProjectDocumentRecord,
  companyId: string
) {
  const location = parseStoredFileLocation(document.url);

  if (
    location.type === "legacy-local" ||
    location.type === "external"
  ) {
    return location.url;
  }

  if (location.type !== "supabase") {
    return null;
  }

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
  const accessUrl = await resolveDocumentAccessUrl(
    document,
    companyId
  );

  const { url, ...publicDocument } = document;

  return {
    ...publicDocument,
    storageReference: url,
    accessUrl,
  };
}

export async function toProjectDocumentResponses(
  documents: ProjectDocumentRecord[],
  companyId: string
) {
  return Promise.all(
    documents.map((document) =>
      toProjectDocumentResponse(document, companyId)
    )
  );
}

export async function listProjectDocuments(
  projectId: string
) {
  const user = await getCurrentProjectUser();

  const project = await findCompanyProjectForDocuments(
    projectId,
    user.companyId
  );

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  return toProjectDocumentResponses(
    await findProjectDocuments(
      projectId,
      user.companyId
    ),
    user.companyId
  );
}

export async function listLeadProjectDocuments(
  leadId: string
) {
  const user = await getCurrentCommercialUser();

  const lead = await findCompanyLeadForDocuments(
    leadId,
    user.companyId
  );

  if (!lead) {
    throw new Error("Oportunidade não encontrada.");
  }

  return toProjectDocumentResponses(
    await findLeadProjectDocuments(
      leadId,
      user.companyId
    ),
    user.companyId
  );
}

export async function getProjectDocumentAccess(
  id: string
) {
  const user = await getCurrentProjectUser();

  const document =
    await findCompanyProjectDocumentById(
      id,
      user.companyId
    );

  if (!document) {
    throw new Error("Documento não encontrado.");
  }

  const location = parseStoredFileLocation(
    document.url
  );

  if (
    location.type === "legacy-local" ||
    location.type === "external"
  ) {
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

function validateDocumentMimeType(
  mimeType: string
) {
  if (
    !(
      PROJECT_DOCUMENT_ALLOWED_MIME_TYPES as readonly string[]
    ).includes(mimeType)
  ) {
    throw new PrivateStorageError(
      "FILE_TYPE_NOT_ALLOWED",
      "O tipo do documento não é permitido."
    );
  }
}

async function persistUploadedDocument(data: {
  companyId: string;
  userId: string;
  projectId?: string | null;
  leadId?: string | null;
  storageEntityId: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  type: ProjectDocumentType;
  notes?: string | null;
}) {
  validateDocumentMimeType(data.mimeType);

  const storedFile = await uploadPrivateFile({
    companyId: data.companyId,
    scope: "project-document",
    entityId: data.storageEntityId,
    originalName: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
  });

  try {
    return await createProjectDocument({
      projectId: data.projectId ?? null,
      leadId: data.leadId ?? null,
      name: data.name,
      url: storedFile.reference,
      mimeType: data.mimeType,
      size: data.size,
      type: data.type,
      notes: data.notes,
      uploadedById: data.userId,
    });
  } catch (persistenceError) {
    try {
      await deletePrivateFile({
        companyId: data.companyId,
        referenceOrPath: storedFile.reference,
      });
    } catch (compensationError) {
      console.error(
        "Falha ao compensar upload de documento.",
        {
          storageCode:
            compensationError instanceof
            PrivateStorageError
              ? compensationError.code
              : "UNKNOWN",
        }
      );

      throw new Error(
        "Não foi possível salvar o documento nem concluir a compensação do arquivo.",
        {
          cause: new AggregateError([
            persistenceError,
            compensationError,
          ]),
        }
      );
    }

    throw persistenceError;
  }
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
  const user = await getCurrentProjectUser();

  const project = await findCompanyProjectForDocuments(
    data.projectId,
    user.companyId
  );

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  const document = await persistUploadedDocument({
    companyId: user.companyId,
    userId: user.id,
    projectId: data.projectId,
    leadId: project.client.leadId,
    storageEntityId: data.projectId,
    name: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
    type: data.type,
    notes: data.notes,
  });

  await registerProjectEvent({
    projectId: data.projectId,
    type: "DOCUMENT_UPLOADED",
    title: "Documento enviado",
    description: `${data.name} foi adicionado ao projeto.`,
  });

  return toProjectDocumentResponse(
    document,
    user.companyId
  );
}

export async function uploadLeadProjectDocument(data: {
  leadId: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  type: ProjectDocumentType;
  notes?: string | null;
}) {
  const user = await getCurrentCommercialUser();

  const lead = await findCompanyLeadForDocuments(
    data.leadId,
    user.companyId
  );

  if (!lead) {
    throw new Error("Oportunidade não encontrada.");
  }

  const existingProjectId =
    lead.client?.projects[0]?.id ?? null;

  const document = await persistUploadedDocument({
    companyId: user.companyId,
    userId: user.id,
    projectId: existingProjectId,
    leadId: data.leadId,
    storageEntityId: data.leadId,
    name: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
    type: data.type,
    notes: data.notes,
  });

  if (existingProjectId) {
    await registerProjectEvent({
      projectId: existingProjectId,
      type: "DOCUMENT_UPLOADED",
      title: "Documento enviado pela oportunidade",
      description: `${data.name} foi enviado pelo Pipeline/Oportunidades.`,
    });
  }

  return toProjectDocumentResponse(
    document,
    user.companyId
  );
}

export async function removeProjectDocument(
  id: string
) {
  const user = await getCurrentProjectUser();

  const document =
    await findCompanyProjectDocumentById(
      id,
      user.companyId
    );

  if (!document) {
    throw new Error("Documento não encontrado.");
  }

  const location = parseStoredFileLocation(
    document.url
  );

  if (location.type === "supabase") {
    try {
      await deletePrivateFile({
        companyId: user.companyId,
        referenceOrPath: document.url,
      });
    } catch (error) {
      if (
        !(
          error instanceof PrivateStorageError
        ) ||
        error.code !== "FILE_NOT_FOUND"
      ) {
        throw error;
      }
    }
  } else if (location.type === "legacy-local") {
    if (!document.projectId) {
      throw new PrivateStorageError(
        "INVALID_STORAGE_PATH",
        "Documento legado sem projeto vinculado."
      );
    }

    await removeStoredProjectDocument({
      projectId: document.projectId,
      url: document.url,
    });
  } else if (location.type === "invalid") {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o documento é inválida."
    );
  }

  await deleteProjectDocument(id);

  if (document.projectId) {
    await registerProjectEvent({
      projectId: document.projectId,
      type: "DOCUMENT_DELETED",
      title: "Documento removido",
      description: `${document.name} (${document.type.replaceAll(
        "_",
        " "
      )}) foi removido do projeto.`,
    });
  }

  return document;
}

export async function setProjectDocumentFavorite(
  data: {
    id: string;
    isFavorite: boolean;
  }
) {
  const user = await getCurrentProjectUser();

  const currentDocument =
    await findCompanyProjectDocumentById(
      data.id,
      user.companyId
    );

  if (!currentDocument) {
    throw new Error("Documento não encontrado.");
  }

  const document =
    await updateProjectDocumentFavorite(
      data.id,
      data.isFavorite
    );

  if (
    currentDocument.projectId &&
    currentDocument.isFavorite !==
      data.isFavorite
  ) {
    await registerProjectEvent({
      projectId:
        currentDocument.projectId,
      type: data.isFavorite
        ? "DOCUMENT_FAVORITED"
        : "DOCUMENT_UNFAVORITED",
      title: data.isFavorite
        ? "Documento favoritado"
        : "Documento removido dos favoritos",
      description: `${
        currentDocument.name
      } ${
        data.isFavorite
          ? "foi adicionado aos favoritos"
          : "foi removido dos favoritos"
      } por ${user.name}.`,
    });
  }

  return toProjectDocumentResponse(
    document,
    user.companyId
  );
}