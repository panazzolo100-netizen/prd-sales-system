import { validateStorageBucketName } from "./storage.config";
import { assertValidStoragePath } from "./storage-path";
import type { StoredFileLocation } from "./storage.types";

const SUPABASE_PROTOCOL = "supabase://";

export function createSupabaseStorageReference(bucket: string, path: string) {
  return `${SUPABASE_PROTOCOL}${validateStorageBucketName(bucket)}/${assertValidStoragePath(path)}`;
}

export function parseSupabaseStorageReference(value: string) {
  if (!value.startsWith(SUPABASE_PROTOCOL)) throw new Error("Referência de Storage inválida.");
  const remainder = value.slice(SUPABASE_PROTOCOL.length);
  const separator = remainder.indexOf("/");
  if (separator <= 0) throw new Error("Referência de Storage inválida.");
  return {
    bucket: validateStorageBucketName(remainder.slice(0, separator)),
    path: assertValidStoragePath(remainder.slice(separator + 1)),
  };
}

export function isSupabaseStorageReference(value: string) {
  try {
    parseSupabaseStorageReference(value);
    return true;
  } catch {
    return false;
  }
}

export function parseStoredFileLocation(value: string): StoredFileLocation {
  if (value.startsWith(SUPABASE_PROTOCOL)) {
    try {
      return { type: "supabase", ...parseSupabaseStorageReference(value) };
    } catch {
      return { type: "invalid" };
    }
  }
  if (value.startsWith("/uploads/")) return { type: "legacy-local", url: value };
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? { type: "external", url: value }
      : { type: "invalid" };
  } catch {
    return { type: "invalid" };
  }
}
