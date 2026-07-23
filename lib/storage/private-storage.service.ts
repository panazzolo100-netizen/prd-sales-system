import "server-only";

import {
  getSupabaseServerStorageBucket,
  getSupabaseStorageBucketName,
} from "@/lib/supabase/server-storage";
import {
  DEFAULT_SIGNED_URL_DURATION_SECONDS,
  getStorageBucketName,
  PRIVATE_FILE_CACHE_CONTROL,
} from "./storage.config";
import { PrivateStorageError } from "./storage.errors";
import { assertCompanyStoragePath, buildPrivateStoragePath } from "./storage-path";
import {
  createSupabaseStorageReference,
  parseSupabaseStorageReference,
} from "./storage-reference";
import type { StoredPrivateFile, UploadPrivateFileInput } from "./storage.types";
import { validatePrivateFile } from "./storage-validation";

function resolveCompanyFile(companyId: string, referenceOrPath: string) {
  const configuredBucket = getStorageBucketName();
  const parsed = referenceOrPath.startsWith("supabase://")
    ? parseSupabaseStorageReference(referenceOrPath)
    : { bucket: configuredBucket, path: referenceOrPath };
  if (parsed.bucket !== configuredBucket) {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência aponta para um bucket não autorizado."
    );
  }
  return {
    bucket: parsed.bucket,
    path: assertCompanyStoragePath(companyId, parsed.path),
  };
}

function isNotFound(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: number; statusCode?: string | number };
  return Number(candidate.status ?? candidate.statusCode) === 404;
}

export async function uploadPrivateFile(
  input: UploadPrivateFileInput
): Promise<StoredPrivateFile> {
  validatePrivateFile(input);
  const path = buildPrivateStoragePath(input);
  const bucket = getSupabaseStorageBucketName();
  const { error } = await getSupabaseServerStorageBucket().upload(path, input.buffer, {
    contentType: input.mimeType,
    cacheControl: PRIVATE_FILE_CACHE_CONTROL,
    upsert: false,
  });
  if (error) {
    throw new PrivateStorageError(
      "STORAGE_UPLOAD_FAILED",
      "Não foi possível armazenar o arquivo.",
      { cause: error }
    );
  }
  return {
    bucket,
    path,
    reference: createSupabaseStorageReference(bucket, path),
    originalName: input.originalName,
    mimeType: input.mimeType,
    size: input.size,
  };
}

export async function deletePrivateFile(input: {
  companyId: string;
  referenceOrPath: string;
}) {
  const { path } = resolveCompanyFile(input.companyId, input.referenceOrPath);
  const { data, error } = await getSupabaseServerStorageBucket().remove([path]);
  if (error) {
    const missing = isNotFound(error);
    throw new PrivateStorageError(
      missing ? "FILE_NOT_FOUND" : "STORAGE_DELETE_FAILED",
      missing ? "Arquivo não encontrado." : "Não foi possível excluir o arquivo.",
      { cause: error }
    );
  }
  if (!data.some((item) => item.name === path)) {
    throw new PrivateStorageError("FILE_NOT_FOUND", "Arquivo não encontrado.");
  }
}

export async function createPrivateFileSignedUrl(input: {
  companyId: string;
  reference: string;
  expiresInSeconds?: number;
}) {
  const { path } = resolveCompanyFile(input.companyId, input.reference);
  const expiresInSeconds =
    input.expiresInSeconds ?? DEFAULT_SIGNED_URL_DURATION_SECONDS;
  if (!Number.isSafeInteger(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new PrivateStorageError(
      "SIGNED_URL_FAILED",
      "A duração da URL assinada é inválida."
    );
  }
  const { data, error } = await getSupabaseServerStorageBucket().createSignedUrl(
    path,
    expiresInSeconds
  );
  if (error) {
    throw new PrivateStorageError(
      "SIGNED_URL_FAILED",
      "Não foi possível criar a URL temporária.",
      { cause: error }
    );
  }
  return {
    url: data.signedUrl,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

export async function downloadPrivateFile(input: {
  companyId: string;
  reference: string;
}) {
  const { path } = resolveCompanyFile(input.companyId, input.reference);
  const { data, error } = await getSupabaseServerStorageBucket().download(path);
  if (error) {
    const missing = isNotFound(error);
    throw new PrivateStorageError(
      missing ? "FILE_NOT_FOUND" : "STORAGE_DOWNLOAD_FAILED",
      missing ? "Arquivo não encontrado." : "Não foi possível baixar o arquivo.",
      { cause: error }
    );
  }
  return {
    buffer: Buffer.from(await data.arrayBuffer()),
    mimeType: data.type || undefined,
  };
}
