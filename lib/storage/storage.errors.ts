export type StorageErrorCode =
  | "STORAGE_CONFIGURATION_MISSING"
  | "INVALID_FILE"
  | "FILE_TYPE_NOT_ALLOWED"
  | "FILE_SIZE_EXCEEDED"
  | "INVALID_STORAGE_PATH"
  | "CROSS_COMPANY_ACCESS"
  | "STORAGE_UPLOAD_FAILED"
  | "STORAGE_DOWNLOAD_FAILED"
  | "STORAGE_DELETE_FAILED"
  | "SIGNED_URL_FAILED"
  | "FILE_NOT_FOUND";

export class PrivateStorageError extends Error {
  constructor(public readonly code: StorageErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PrivateStorageError";
  }
}
