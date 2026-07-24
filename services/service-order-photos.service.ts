import { unlink } from "node:fs/promises";
import path from "node:path";

import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import { ServiceOrderPhotoCategory } from "@/lib/generated/prisma/enums";
import {
  SERVICE_ORDER_PHOTO_ALLOWED_MIME_TYPES,
} from "@/lib/storage/storage.config";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  createPrivateFileSignedUrl,
  deletePrivateFile,
  uploadPrivateFile,
} from "@/lib/storage/private-storage.service";
import { parseStoredFileLocation } from "@/lib/storage/storage-reference";
import {
  createServiceOrderPhoto,
  deleteServiceOrderPhoto,
  findCompanyServiceOrderForPhoto,
  findServiceOrderPhotoById,
  findServiceOrderPhotos,
} from "@/repositories/service-order-photos.repository";
import { registerServiceOrderEvent } from "@/services/service-order-timeline.service";

type ServiceOrderPhotoRecord = {
  id: string;
  serviceOrderId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  category: ServiceOrderPhotoCategory;
  notes: string | null;
  createdAt: Date;
};

async function resolvePhotoAccessUrl(photo: { url: string }, companyId: string) {
  const location = parseStoredFileLocation(photo.url);
  if (location.type === "legacy-local" || location.type === "external") return location.url;
  if (location.type !== "supabase") return null;
  try {
    return (
      await createPrivateFileSignedUrl({ companyId, reference: photo.url })
    ).url;
  } catch {
    return null;
  }
}

export async function toServiceOrderPhotoResponse<T extends { url: string }>(
  photo: T,
  companyId: string
) {
  const accessUrl = await resolvePhotoAccessUrl(photo, companyId);
  const { url, ...publicPhoto } = photo;
  return { ...publicPhoto, storageReference: url, accessUrl };
}

export async function toServiceOrderPhotoResponses(
  photos: ServiceOrderPhotoRecord[],
  companyId: string
) {
  return Promise.all(photos.map((photo) => toServiceOrderPhotoResponse(photo, companyId)));
}

export async function listServiceOrderPhotos(serviceOrderId: string) {
  const companyId = await getCurrentCompanyId();
  if (!(await findCompanyServiceOrderForPhoto(serviceOrderId, companyId))) {
    throw new Error("Ordem de Serviço não encontrada.");
  }
  return toServiceOrderPhotoResponses(
    await findServiceOrderPhotos(serviceOrderId, companyId),
    companyId
  );
}

export async function getServiceOrderPhotoAccess(id: string) {
  const companyId = await getCurrentCompanyId();
  const photo = await findServiceOrderPhotoById(id, companyId);
  if (!photo) throw new Error("Foto não encontrada.");
  const accessUrl = await resolvePhotoAccessUrl(photo, companyId);
  if (!accessUrl) {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para a foto é inválida."
    );
  }
  return accessUrl;
}

export async function uploadServiceOrderPhoto(data: {
  serviceOrderId: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  category: ServiceOrderPhotoCategory;
  notes?: string | null;
}) {
  const companyId = await getCurrentCompanyId();
  if (!(await findCompanyServiceOrderForPhoto(data.serviceOrderId, companyId))) {
    throw new Error("Ordem de Serviço não encontrada.");
  }
  if (!(SERVICE_ORDER_PHOTO_ALLOWED_MIME_TYPES as readonly string[]).includes(data.mimeType)) {
    throw new PrivateStorageError("FILE_TYPE_NOT_ALLOWED", "O tipo da imagem não é permitido.");
  }

  const storedFile = await uploadPrivateFile({
    companyId,
    scope: "service-order-photo",
    entityId: data.serviceOrderId,
    originalName: data.name,
    mimeType: data.mimeType,
    size: data.size,
    buffer: data.buffer,
  });

  let photo: ServiceOrderPhotoRecord;
  try {
    photo = await createServiceOrderPhoto({
      serviceOrderId: data.serviceOrderId,
      name: data.name,
      url: storedFile.reference,
      mimeType: data.mimeType,
      size: data.size,
      category: data.category,
      notes: data.notes,
    });
  } catch (persistenceError) {
    try {
      await deletePrivateFile({ companyId, referenceOrPath: storedFile.reference });
    } catch (compensationError) {
      console.error("Falha ao compensar upload de foto da OS.", {
        storageCode:
          compensationError instanceof PrivateStorageError
            ? compensationError.code
            : "UNKNOWN",
      });
      throw new Error(
        "Não foi possível salvar a foto nem concluir a compensação do arquivo.",
        { cause: new AggregateError([persistenceError, compensationError]) }
      );
    }
    throw persistenceError;
  }

  const categoryLabel = { ANTES: "Antes", DURANTE: "Durante", DEPOIS: "Depois" }[
    data.category
  ];
  await registerServiceOrderEvent({
    serviceOrderId: data.serviceOrderId,
    type: "FOTO_ADICIONADA",
    title: "Foto adicionada",
    description: `${categoryLabel}: ${data.name}`,
  });
  return toServiceOrderPhotoResponse(photo, companyId);
}

async function removeLegacyPhoto(serviceOrderId: string, url: string) {
  const allowedDirectory = path.resolve(
    process.cwd(),
    "public",
    "uploads",
    "os",
    serviceOrderId
  );
  const filePath = path.resolve(process.cwd(), "public", url.replace(/^[/\\]+/, ""));
  const expectedPrefix = `${allowedDirectory}${path.sep}`;
  if (!filePath.startsWith(expectedPrefix) || filePath === allowedDirectory) {
    throw new PrivateStorageError("INVALID_STORAGE_PATH", "O caminho da foto legada é inválido.");
  }
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw new Error("Não foi possível remover o arquivo físico da foto.", { cause: error });
    }
  }
}

export async function removeServiceOrderPhoto(id: string) {
  const companyId = await getCurrentCompanyId();
  const photo = await findServiceOrderPhotoById(id, companyId);
  if (!photo) throw new Error("Foto não encontrada.");

  const location = parseStoredFileLocation(photo.url);
  if (location.type === "supabase") {
    try {
      await deletePrivateFile({ companyId, referenceOrPath: photo.url });
    } catch (error) {
      if (!(error instanceof PrivateStorageError) || error.code !== "FILE_NOT_FOUND") throw error;
    }
  } else if (location.type === "legacy-local") {
    await removeLegacyPhoto(photo.serviceOrderId, photo.url);
  } else if (location.type === "invalid") {
    throw new PrivateStorageError(
      "INVALID_STORAGE_PATH",
      "A referência armazenada para a foto é inválida."
    );
  }

  await deleteServiceOrderPhoto(id);
  await registerServiceOrderEvent({
    serviceOrderId: photo.serviceOrderId,
    type: "FOTO_REMOVIDA",
    title: "Foto removida",
    description: photo.name,
  });
  return photo;
}
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.SERVICE_ORDERS_INTERNAL)).companyId;
}
