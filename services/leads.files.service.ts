import { unlink } from "node:fs/promises";
import path from "node:path";

import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
async function getCurrentAppUser() {
  return requirePermission(PERMISSIONS.COMMERCIAL);
}
import { LEAD_FILE_ALLOWED_MIME_TYPES } from "@/lib/storage/storage.config";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  createPrivateFileSignedUrl,
  deletePrivateFile,
  uploadPrivateFile,
} from "@/lib/storage/private-storage.service";
import { parseStoredFileLocation } from "@/lib/storage/storage-reference";
import {
  createLeadActivity,
  createLeadFile,
  deleteLeadFile,
  findCompanyLeadFileById,
  findLeadById,
} from "@/repositories/leads.repository";

type LeadFileRecord = {
  id: string;
  leadId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: Date;
};

async function resolveLeadFileAccessUrl(file: { url: string }, companyId: string) {
  const location = parseStoredFileLocation(file.url);
  if (location.type === "legacy-local" || location.type === "external") return location.url;
  if (location.type !== "supabase") return null;
  try {
    return (
      await createPrivateFileSignedUrl({ companyId, reference: file.url })
    ).url;
  } catch {
    return null;
  }
}

export async function toLeadFileResponse<T extends { url: string }>(
  file: T,
  companyId: string
) {
  const accessUrl = await resolveLeadFileAccessUrl(file, companyId);
  const { url, ...publicFile } = file;
  return { ...publicFile, storageReference: url, accessUrl };
}

export async function toLeadFileResponses(files: LeadFileRecord[], companyId: string) {
  return Promise.all(files.map((file) => toLeadFileResponse(file, companyId)));
}

export async function getCompanyLeadFileAccess(id: string) {
  const user = await getCurrentAppUser();
  const file = await findCompanyLeadFileById(id, user.companyId);
  if (!file) throw new Error("Arquivo não encontrado.");
  const accessUrl = await resolveLeadFileAccessUrl(file, user.companyId);
  if (!accessUrl) {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o arquivo é inválida."
    );
  }
  return accessUrl;
}

export async function uploadCompanyLeadFile(data: {
  leadId: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  kind?: "PROPOSAL_INTERNAL" | "PROPOSAL_CLIENT";
}) {
  const user = await getCurrentAppUser();
  const lead = await findLeadById(data.leadId, user.companyId);
  if (!lead) throw new Error("Lead não encontrado.");
  if (!(LEAD_FILE_ALLOWED_MIME_TYPES as readonly string[]).includes(data.mimeType)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "O tipo do arquivo não é permitido.");
  }
  const proposalMimeTypes = {
    PROPOSAL_INTERNAL: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    PROPOSAL_CLIENT: ["application/pdf"],
  } as const;
  if (
    data.kind &&
    !(proposalMimeTypes[data.kind] as readonly string[]).includes(data.mimeType)
  ) {
    throw new PrivateStorageError(
      "FILE_TYPE_NOT_ALLOWED",
      data.kind === "PROPOSAL_INTERNAL"
        ? "A proposta interna deve ser um arquivo Excel (.xls ou .xlsx)."
        : "A proposta do cliente deve ser um arquivo PDF."
      );
  }
  if (data.kind === "PROPOSAL_CLIENT") {
    const pdfSignature = data.buffer.subarray(0, 5).toString("ascii");
    if (pdfSignature !== "%PDF-") {
      throw new PrivateStorageError(
        "INVALID_FILE",
        "O conteúdo enviado não corresponde a um arquivo PDF válido."
      );
    }
  }
  if (data.kind === "PROPOSAL_INTERNAL") {
    const isLegacyExcel =
      data.buffer.length >= 8 &&
      data.buffer.subarray(0, 8).equals(
        Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
      );
    const isOpenXmlExcel =
      data.buffer.length >= 4 &&
      data.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    if (!isLegacyExcel && !isOpenXmlExcel) {
      throw new PrivateStorageError(
        "INVALID_FILE",
        "O conteúdo enviado não corresponde a um arquivo Excel válido."
      );
    }
  }

  const storedFile = await uploadPrivateFile({
    companyId: user.companyId,
    scope: data.kind === "PROPOSAL_INTERNAL" ? "proposal-internal" : "lead-file",
    entityId: data.leadId,
    originalName: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
  });

  let file: LeadFileRecord;
  try {
    file = await createLeadFile({
      leadId: data.leadId,
      name: data.name,
      url: storedFile.reference,
      mimeType: data.mimeType,
      size: data.size,
    });
  } catch (persistenceError) {
    try {
      await deletePrivateFile({
        companyId: user.companyId,
        referenceOrPath: storedFile.reference,
      });
    } catch (compensationError) {
      console.error("Falha ao compensar upload de arquivo do Lead.", {
        storageCode:
          compensationError instanceof PrivateStorageError
            ? compensationError.code
            : "UNKNOWN",
      });
      throw new Error(
        "Não foi possível salvar o arquivo nem concluir a compensação.",
        { cause: new AggregateError([persistenceError, compensationError]) }
      );
    }
    throw persistenceError;
  }

  await createLeadActivity({
    leadId: data.leadId,
    userId: lead.ownerId,
    type: "FILE_UPLOADED",
    title: "Arquivo enviado",
    notes: data.name,
  });
  return toLeadFileResponse(file, user.companyId);
}

async function removeLegacyLeadFile(url: string) {
  const allowedDirectory = path.resolve(process.cwd(), "public", "uploads", "leads");
  const filePath = path.resolve(process.cwd(), "public", url.replace(/^[/\\]+/, ""));
  if (!filePath.startsWith(`${allowedDirectory}${path.sep}`) || filePath === allowedDirectory) {
    throw new PrivateStorageError("INVALID_STORAGE_PATH", "O caminho do arquivo legado é inválido.");
  }
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw new Error("Não foi possível remover o arquivo físico.", { cause: error });
    }
  }
}

export async function removeCompanyLeadFile(id: string) {
  const user = await getCurrentAppUser();
  const file = await findCompanyLeadFileById(id, user.companyId);
  if (!file) throw new Error("Arquivo não encontrado.");
  const location = parseStoredFileLocation(file.url);
  if (location.type === "supabase") {
    try {
      await deletePrivateFile({ companyId: user.companyId, referenceOrPath: file.url });
    } catch (error) {
      if (!(error instanceof PrivateStorageError) || error.code !== "FILE_NOT_FOUND") throw error;
    }
  } else if (location.type === "legacy-local") {
    await removeLegacyLeadFile(file.url);
  } else if (location.type === "invalid") {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para o arquivo é inválida."
    );
  }
  await deleteLeadFile(id);
  await createLeadActivity({
    leadId: file.leadId,
    userId: user.id,
    type: "FILE_DELETED",
    title: "Arquivo removido",
    notes: file.name,
  });
  return file;
}
