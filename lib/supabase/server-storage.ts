import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getStorageBucketName } from "@/lib/storage/storage.config";
import { PrivateStorageError } from "@/lib/storage/storage.errors";

let privilegedStorageClient: SupabaseClient | null = null;

function requireServerEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new PrivateStorageError(
      "STORAGE_CONFIGURATION_MISSING",
      `Configuração obrigatória ausente: ${name}.`
    );
  }
  return value;
}

export function getSupabaseStorageBucketName() {
  return getStorageBucketName();
}

export function getSupabaseServerStorageClient() {
  if (typeof window !== "undefined") {
    throw new Error("O cliente privilegiado do Supabase Storage é exclusivo do servidor.");
  }
  if (privilegedStorageClient) return privilegedStorageClient;
  privilegedStorageClient = createClient(
    requireServerEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnvironmentVariable("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
  return privilegedStorageClient;
}

export function getSupabaseServerStorageBucket() {
  return getSupabaseServerStorageClient().storage.from(getSupabaseStorageBucketName());
}
