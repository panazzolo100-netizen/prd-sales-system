export type StorageScope =
  | "project-document"
  | "project-photo"
  | "service-order-photo"
  | "service-order-signature"
  | "lead-file"
  | "financial-attachment"
  | "branding";

export type UploadPrivateFileInput = {
  companyId: string;
  scope: StorageScope;
  entityId?: string;
  signatureType?: "client" | "technician";
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

export type StoredPrivateFile = {
  bucket: string;
  path: string;
  reference: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export type StoredFileLocation =
  | { type: "supabase"; bucket: string; path: string }
  | { type: "legacy-local"; url: string }
  | { type: "external"; url: string }
  | { type: "invalid" };
