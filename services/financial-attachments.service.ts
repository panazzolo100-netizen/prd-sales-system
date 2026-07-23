import { unlink } from "node:fs/promises";
import path from "node:path";

import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { FINANCIAL_ATTACHMENT_ALLOWED_MIME_TYPES } from "@/lib/storage/storage.config";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  createPrivateFileSignedUrl,
  deletePrivateFile,
  uploadPrivateFile,
} from "@/lib/storage/private-storage.service";
import { parseStoredFileLocation } from "@/lib/storage/storage-reference";
import {
  createFinancialAttachment,
  deleteFinancialAttachment,
  findCompanyFinancialForAttachment,
  findFinancialAttachmentById,
  findFinancialAttachments,
} from "@/repositories/financial-attachments.repository";

type FinancialAttachmentRecord = {
  id: string;
  financialId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: string;
  createdAt: Date;
};

async function resolveAttachmentAccessUrl(
  attachment: { url: string },
  companyId: string
) {
  const location = parseStoredFileLocation(attachment.url);
  if (location.type === "legacy-local" || location.type === "external") return location.url;
  if (location.type !== "supabase") return null;
  try {
    return (
      await createPrivateFileSignedUrl({ companyId, reference: attachment.url })
    ).url;
  } catch {
    return null;
  }
}

export async function toFinancialAttachmentResponse<T extends { url: string }>(
  attachment: T,
  companyId: string
) {
  const accessUrl = await resolveAttachmentAccessUrl(attachment, companyId);
  const { url, ...publicAttachment } = attachment;
  return { ...publicAttachment, storageReference: url, accessUrl };
}

export async function toFinancialAttachmentResponses(
  attachments: FinancialAttachmentRecord[],
  companyId: string
) {
  return Promise.all(
    attachments.map((attachment) => toFinancialAttachmentResponse(attachment, companyId))
  );
}

export async function listFinancialAttachments(financialId: string) {
  const companyId = await getCurrentCompanyId();
  if (!(await findCompanyFinancialForAttachment(financialId, companyId))) {
    throw new Error("Financeiro não encontrado.");
  }
  return toFinancialAttachmentResponses(
    await findFinancialAttachments(financialId, companyId),
    companyId
  );
}

export async function getFinancialAttachmentAccess(id: string) {
  const companyId = await getCurrentCompanyId();
  const attachment = await findFinancialAttachmentById(id, companyId);
  if (!attachment) throw new Error("Anexo não encontrado.");
  const accessUrl = await resolveAttachmentAccessUrl(attachment, companyId);
  if (!accessUrl) {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o anexo é inválida."
    );
  }
  return accessUrl;
}

export async function uploadFinancialAttachment(data: {
  financialId: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  type: string;
}) {
  const companyId = await getCurrentCompanyId();
  if (!(await findCompanyFinancialForAttachment(data.financialId, companyId))) {
    throw new Error("Financeiro não encontrado.");
  }
  if (!(FINANCIAL_ATTACHMENT_ALLOWED_MIME_TYPES as readonly string[]).includes(data.mimeType)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "O tipo do anexo não é permitido.");
  }

  const storedFile = await uploadPrivateFile({
    companyId,
    scope: "financial-attachment",
    entityId: data.financialId,
    originalName: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
  });

  let attachment: FinancialAttachmentRecord;
  try {
    attachment = await createFinancialAttachment({
      financialId: data.financialId,
      name: data.name,
      url: storedFile.reference,
      mimeType: data.mimeType,
      size: data.size,
      type: data.type,
    });
  } catch (persistenceError) {
    try {
      await deletePrivateFile({ companyId, referenceOrPath: storedFile.reference });
    } catch (compensationError) {
      console.error("Falha ao compensar upload de anexo financeiro.", {
        storageCode:
          compensationError instanceof PrivateStorageError
            ? compensationError.code
            : "UNKNOWN",
      });
      throw new Error(
        "Não foi possível salvar o anexo nem concluir a compensação.",
        { cause: new AggregateError([persistenceError, compensationError]) }
      );
    }
    throw persistenceError;
  }
  return toFinancialAttachmentResponse(attachment, companyId);
}

async function removeLegacyFinancialAttachment(financialId: string, url: string) {
  const allowedDirectory = path.resolve(
    process.cwd(),
    "public",
    "uploads",
    "financial",
    financialId
  );
  const filePath = path.resolve(process.cwd(), "public", url.replace(/^[/\\]+/, ""));
  if (!filePath.startsWith(`${allowedDirectory}${path.sep}`) || filePath === allowedDirectory) {
    throw new PrivateStorageError("INVALID_STORAGE_PATH", "O caminho do anexo legado é inválido.");
  }
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw new Error("Não foi possível remover o arquivo físico do anexo.", { cause: error });
    }
  }
}

export async function removeFinancialAttachment(id: string) {
  const companyId = await getCurrentCompanyId();
  const attachment = await findFinancialAttachmentById(id, companyId);
  if (!attachment) throw new Error("Anexo não encontrado.");
  const location = parseStoredFileLocation(attachment.url);
  if (location.type === "supabase") {
    try {
      await deletePrivateFile({ companyId, referenceOrPath: attachment.url });
    } catch (error) {
      if (!(error instanceof PrivateStorageError) || error.code !== "FILE_NOT_FOUND") throw error;
    }
  } else if (location.type === "legacy-local") {
    await removeLegacyFinancialAttachment(attachment.financialId, attachment.url);
  } else if (location.type === "invalid") {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o anexo é inválida."
    );
  }
  await deleteFinancialAttachment(id);
  return attachment;
}
