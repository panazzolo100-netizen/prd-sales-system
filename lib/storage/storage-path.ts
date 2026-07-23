import { randomUUID } from "node:crypto";

import { PrivateStorageError } from "./storage.errors";
import type { StorageScope } from "./storage.types";

const SAFE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const MAX_FILENAME_LENGTH = 120;

const SCOPE_PATHS: Record<StorageScope, (entityId?: string) => string[]> = {
  "project-document": (id) => ["projects", requireEntityId(id), "documents"],
  "project-photo": (id) => ["projects", requireEntityId(id), "photos"],
  "service-order-photo": (id) => ["service-orders", requireEntityId(id), "photos"],
  "service-order-signature": (id) => ["service-orders", requireEntityId(id), "signatures"],
  "lead-file": (id) => ["leads", requireEntityId(id), "files"],
  "financial-attachment": (id) => ["financial", requireEntityId(id), "attachments"],
  branding: () => ["branding"],
};

function invalidPath(message = "O caminho do arquivo no Storage é inválido."): never {
  throw new PrivateStorageError("INVALID_STORAGE_PATH", message);
}

function requireEntityId(entityId?: string) {
  if (!entityId) invalidPath("O identificador da entidade é obrigatório para este tipo de arquivo.");
  return validateStorageIdentifier(entityId, "entityId");
}

export function validateStorageIdentifier(value: string, label: "companyId" | "entityId") {
  const normalized = value.trim();
  if (!SAFE_IDENTIFIER.test(normalized) || normalized.includes("..")) {
    invalidPath(`${label} possui formato inválido.`);
  }
  return normalized;
}

export function getFileExtension(filename: string) {
  const cleanName = filename.replace(/[\\/\0]/g, "");
  const lastDot = cleanName.lastIndexOf(".");
  return lastDot > 0 && lastDot < cleanName.length - 1
    ? cleanName.slice(lastDot + 1).toLowerCase()
    : "";
}

export function sanitizeStorageFilename(filename: string) {
  const rawExtension = getFileExtension(filename);
  const extension = rawExtension.replace(/[^a-z0-9]/g, "").slice(0, 10);
  const withoutExtension = rawExtension ? filename.slice(0, filename.lastIndexOf(".")) : filename;
  let base = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/\0]/g, "-")
    .replace(/\.\.+/g, "-")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "") || "arquivo";
  const suffix = extension ? `.${extension}` : "";
  base = base.slice(0, MAX_FILENAME_LENGTH - suffix.length).replace(/[-_.]+$/g, "") || "arquivo";
  return `${base}${suffix}`;
}

export function assertValidStoragePath(path: string) {
  const normalized = path.trim();
  const segments = normalized.split("/");
  if (
    !normalized || normalized.startsWith("/") || normalized.includes("\\") ||
    normalized.includes("\0") ||
    segments.some((part) => !SAFE_PATH_SEGMENT.test(part) || part === "." || part === "..")
  ) invalidPath();
  return normalized;
}

export function assertCompanyStoragePath(companyId: string, path: string) {
  const safeCompanyId = validateStorageIdentifier(companyId, "companyId");
  const validPath = assertValidStoragePath(path);
  if (!validPath.startsWith(`companies/${safeCompanyId}/`)) {
    throw new PrivateStorageError("CROSS_COMPANY_ACCESS", "O arquivo não pertence à empresa informada.");
  }
  return validPath;
}

export function buildPrivateStoragePath(input: {
  companyId: string;
  scope: StorageScope;
  entityId?: string;
  signatureType?: "client" | "technician";
  originalName: string;
}) {
  const companyId = validateStorageIdentifier(input.companyId, "companyId");
  const directory = SCOPE_PATHS[input.scope](input.entityId);
  if (input.scope === "service-order-signature") {
    if (!input.signatureType) {
      invalidPath("O tipo da assinatura é obrigatório.");
    }
    directory.push(input.signatureType);
  }
  const filename = `${randomUUID()}-${sanitizeStorageFilename(input.originalName)}`;
  return assertCompanyStoragePath(
    companyId,
    ["companies", companyId, ...directory, filename].join("/")
  );
}
