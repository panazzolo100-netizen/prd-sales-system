import { getCurrentCompanyId } from "@/lib/auth/current-user";
import {
  MAX_SIGNATURE_SIZE_BYTES,
  SIGNATURE_ALLOWED_MIME_TYPES,
} from "@/lib/storage/storage.config";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  createPrivateFileSignedUrl,
  deletePrivateFile,
  downloadPrivateFile,
  uploadPrivateFile,
} from "@/lib/storage/private-storage.service";
import { parseStoredFileLocation } from "@/lib/storage/storage-reference";
import {
  findServiceOrderSignatures,
  updateServiceOrderSignatures,
} from "@/repositories/service-orders.repository";
import { registerServiceOrderEvent } from "@/services/service-order-timeline.service";

export type ServiceOrderSignatureType = "client" | "technician";

type ParsedSignature = {
  buffer: Buffer;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  extension: "png" | "jpg" | "webp";
};

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

function assertImageMagic(buffer: Buffer, mimeType: ParsedSignature["mimeType"]) {
  const valid =
    (mimeType === "image/png" &&
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) ||
    (mimeType === "image/jpeg" &&
      buffer.length >= 3 &&
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
    (mimeType === "image/webp" &&
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP");
  if (!valid) {
    throw new PrivateStorageError(
      "INVALID_FILE",
      "O conteúdo da assinatura não corresponde ao formato informado."
    );
  }
}

export function parseSignatureDataUrl(value: string): ParsedSignature {
  const match = DATA_URL_PATTERN.exec(value);
  if (!match || match[2].length % 4 !== 0) {
    throw new PrivateStorageError("INVALID_FILE", "A assinatura enviada é inválida.");
  }
  const mimeType = match[1] as ParsedSignature["mimeType"];
  if (!(SIGNATURE_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "O formato da assinatura não é permitido.");
  }
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.toString("base64").replace(/=+$/, "") !== match[2].replace(/=+$/, "")) {
    throw new PrivateStorageError("INVALID_FILE", "O conteúdo base64 da assinatura é inválido.");
  }
  if (buffer.length > MAX_SIGNATURE_SIZE_BYTES) {
    throw new PrivateStorageError("FILE_SIZE_EXCEEDED", "A assinatura excede o limite de 2 MB.");
  }
  assertImageMagic(buffer, mimeType);
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/jpeg" ? "jpg" : "webp";
  return { buffer, mimeType, extension };
}

async function uploadSignature(input: {
  companyId: string;
  serviceOrderId: string;
  signatureType: ServiceOrderSignatureType;
  dataUrl: string;
}) {
  const parsed = parseSignatureDataUrl(input.dataUrl);
  return uploadPrivateFile({
    companyId: input.companyId,
    scope: "service-order-signature",
    entityId: input.serviceOrderId,
    signatureType: input.signatureType,
    originalName: `assinatura-${input.signatureType}.${parsed.extension}`,
    mimeType: parsed.mimeType,
    size: parsed.buffer.length,
    buffer: parsed.buffer,
  });
}

async function removeStoredSignature(
  companyId: string,
  serviceOrderId: string,
  reference: string
) {
  const location = parseStoredFileLocation(reference);
  if (location.type !== "supabase") return;
  assertSignatureStoragePath(location.path, companyId, serviceOrderId);
  try {
    await deletePrivateFile({ companyId, referenceOrPath: reference });
  } catch (error) {
    if (!(error instanceof PrivateStorageError) || error.code !== "FILE_NOT_FOUND") throw error;
  }
}

function assertSignatureStoragePath(pathValue: string, companyId: string, serviceOrderId?: string) {
  const prefix = serviceOrderId
    ? `companies/${companyId}/service-orders/${serviceOrderId}/signatures/`
    : `companies/${companyId}/service-orders/`;
  if (!pathValue.startsWith(prefix)) {
    throw new PrivateStorageError(
      "CROSS_COMPANY_ACCESS",
      "A assinatura não pertence à Ordem de Serviço informada."
    );
  }
}

export async function saveServiceOrderSignatures(data: {
  id: string;
  customerName?: string | null;
  customerDocument?: string | null;
  customerSignature?: string | null;
  technicianName?: string | null;
  technicianSignature?: string | null;
}) {
  const companyId = await getCurrentCompanyId();
  const current = await findServiceOrderSignatures(data.id, companyId);
  if (!current) throw new Error("Ordem de Serviço não encontrada.");

  const uploaded: Array<{ type: ServiceOrderSignatureType; reference: string }> = [];
  async function resolveInput(
    value: string | null | undefined,
    previous: string | null,
    type: ServiceOrderSignatureType
  ) {
    if (value === undefined || value === previous) return previous;
    if (value === null || value === "") return null;
    if (!value.startsWith("data:image/")) {
      throw new PrivateStorageError("INVALID_FILE", "A nova assinatura deve ser uma imagem desenhada válida.");
    }
    const stored = await uploadSignature({
      companyId,
      serviceOrderId: data.id,
      signatureType: type,
      dataUrl: value,
    });
    uploaded.push({ type, reference: stored.reference });
    return stored.reference;
  }

  let customerSignature: string | null;
  let technicianSignature: string | null;
  try {
    customerSignature = await resolveInput(
      data.customerSignature,
      current.customerSignature,
      "client"
    );
    technicianSignature = await resolveInput(
      data.technicianSignature,
      current.technicianSignature,
      "technician"
    );
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((item) => removeStoredSignature(companyId, data.id, item.reference))
    );
    throw error;
  }

  const hasSignature = Boolean(customerSignature || technicianSignature);
  let updated;
  try {
    updated = await updateServiceOrderSignatures(data.id, companyId, {
      customerName: data.customerName?.trim() || null,
      customerDocument: data.customerDocument?.trim() || null,
      customerSignature,
      technicianName: data.technicianName?.trim() || null,
      technicianSignature,
      signedAt: hasSignature ? current.signedAt ?? new Date() : null,
    });
  } catch (persistenceError) {
    const cleanup = await Promise.allSettled(
      uploaded.map((item) => removeStoredSignature(companyId, data.id, item.reference))
    );
    if (cleanup.some((result) => result.status === "rejected")) {
      console.error("Falha ao compensar upload de assinatura da OS.");
    }
    throw persistenceError;
  }

  const oldReferences = [
    customerSignature !== current.customerSignature ? current.customerSignature : null,
    technicianSignature !== current.technicianSignature ? current.technicianSignature : null,
  ].filter((value): value is string => Boolean(value));
  const cleanup = await Promise.allSettled(
    oldReferences.map((reference) => removeStoredSignature(companyId, data.id, reference))
  );
  if (cleanup.some((result) => result.status === "rejected")) {
    console.error("A assinatura foi atualizada, mas a referência anterior não pôde ser limpa.");
  }

  if (customerSignature && customerSignature !== current.customerSignature) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "CLIENTE_ASSINOU",
      title: "Cliente assinou a OS",
      description: data.customerName?.trim() || "Assinatura do cliente registrada.",
    });
  }
  if (technicianSignature && technicianSignature !== current.technicianSignature) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "TECNICO_ASSINOU",
      title: "Técnico assinou a OS",
      description: data.technicianName?.trim() || "Assinatura do técnico registrada.",
    });
  }
  return {
    ...updated,
    customerSignatureStorageReference: updated.customerSignature,
    technicianSignatureStorageReference: updated.technicianSignature,
    customerSignature: await createSignatureAccessUrl(
      updated.customerSignature,
      companyId,
      data.id
    ),
    technicianSignature: await createSignatureAccessUrl(
      updated.technicianSignature,
      companyId,
      data.id
    ),
  };
}

export async function resolveServiceOrderSignature(
  serviceOrderId: string,
  type: ServiceOrderSignatureType
) {
  const companyId = await getCurrentCompanyId();
  const current = await findServiceOrderSignatures(serviceOrderId, companyId);
  if (!current) throw new Error("Ordem de Serviço não encontrada.");
  const reference = type === "client" ? current.customerSignature : current.technicianSignature;
  if (!reference) throw new Error("Assinatura não encontrada.");
  const location = parseStoredFileLocation(reference);
  if (location.type === "supabase") {
    assertSignatureStoragePath(location.path, companyId, serviceOrderId);
    const downloaded = await downloadPrivateFile({ companyId, reference });
    return { type: "buffer" as const, buffer: downloaded.buffer, mimeType: downloaded.mimeType ?? "image/png" };
  }
  if (reference.startsWith("data:image/")) {
    const parsed = parseSignatureDataUrl(reference);
    return { type: "buffer" as const, buffer: parsed.buffer, mimeType: parsed.mimeType };
  }
  if (location.type === "legacy-local" || location.type === "external") {
    return { type: "redirect" as const, url: location.url };
  }
  throw new PrivateStorageError("INVALID_STORAGE_PATH", "A referência da assinatura é inválida.");
}

export async function createSignatureAccessUrl(
  reference: string | null,
  companyId: string,
  serviceOrderId: string
) {
  if (!reference) return null;
  if (reference.startsWith("data:image/")) return reference;
  const location = parseStoredFileLocation(reference);
  if (location.type === "legacy-local" || location.type === "external") return location.url;
  if (location.type !== "supabase") return null;
  try {
    assertSignatureStoragePath(location.path, companyId, serviceOrderId);
    return (await createPrivateFileSignedUrl({ companyId, reference })).url;
  } catch {
    return null;
  }
}
