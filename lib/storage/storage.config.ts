const DEFAULT_STORAGE_BUCKET = "prd-files";

export const MAX_PRIVATE_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const DEFAULT_SIGNED_URL_DURATION_SECONDS = 10 * 60;
export const PRIVATE_FILE_CACHE_CONTROL = "3600";

export const ALLOWED_MIME_TYPES = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/vnd.ms-excel": ["xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "text/plain": ["txt"],
  "text/csv": ["csv"],
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;
export const PROJECT_DOCUMENT_ALLOWED_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] satisfies AllowedMimeType[]);
export const SERVICE_ORDER_PHOTO_ALLOWED_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
] satisfies AllowedMimeType[]);
export const LEAD_FILE_ALLOWED_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] satisfies AllowedMimeType[]);
export const FINANCIAL_ATTACHMENT_ALLOWED_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] satisfies AllowedMimeType[]);
export const SIGNATURE_ALLOWED_MIME_TYPES = Object.freeze([
  "image/png",
  "image/jpeg",
  "image/webp",
] satisfies AllowedMimeType[]);
export const MAX_SIGNATURE_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_FILE_EXTENSIONS = Object.freeze(
  Array.from(new Set(Object.values(ALLOWED_MIME_TYPES).flat()))
);

const BUCKET_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/;

export function validateStorageBucketName(bucket: string) {
  const normalized = bucket.trim();
  if (!BUCKET_NAME_PATTERN.test(normalized) || normalized.includes("..")) {
    throw new Error("O nome configurado para o bucket do Storage é inválido.");
  }
  return normalized;
}

export function getStorageBucketName() {
  return validateStorageBucketName(
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_STORAGE_BUCKET
  );
}
