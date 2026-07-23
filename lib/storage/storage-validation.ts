import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_PRIVATE_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from "./storage.config";
import { PrivateStorageError } from "./storage.errors";
import { getFileExtension } from "./storage-path";
import type { UploadPrivateFileInput } from "./storage.types";

export function validatePrivateFile(input: UploadPrivateFileInput) {
  if (!input.companyId.trim() || !input.originalName.trim()) {
    throw new PrivateStorageError("INVALID_FILE", "Empresa e nome do arquivo são obrigatórios.");
  }
  if (
    !Number.isSafeInteger(input.size) || input.size <= 0 || input.buffer.length === 0 ||
    input.buffer.length !== input.size
  ) {
    throw new PrivateStorageError("INVALID_FILE", "O arquivo está vazio ou possui tamanho inconsistente.");
  }
  if (input.size > MAX_PRIVATE_FILE_SIZE_BYTES) {
    throw new PrivateStorageError("FILE_SIZE_EXCEEDED", "O arquivo excede o limite permitido.");
  }
  if (!(input.mimeType in ALLOWED_MIME_TYPES)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "O tipo do arquivo não é permitido.");
  }
  const extension = getFileExtension(input.originalName);
  if (!extension || !(ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "A extensão do arquivo não é permitida.");
  }
  const allowedExtensions = ALLOWED_MIME_TYPES[input.mimeType as AllowedMimeType] as readonly string[];
  if (!allowedExtensions.includes(extension)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "A extensão não corresponde ao tipo informado.");
  }
  return input;
}
