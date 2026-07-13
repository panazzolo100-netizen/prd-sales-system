import { ServiceOrderPhotoCategory } from "@/lib/generated/prisma/enums";

import {
  createServiceOrderPhoto,
  deleteServiceOrderPhoto,
  findServiceOrderPhotoById,
  findServiceOrderPhotos,
} from "@/repositories/service-order-photos.repository";

import { registerServiceOrderEvent } from "@/services/service-order-timeline.service";

export async function listServiceOrderPhotos(
  serviceOrderId: string
) {
  return findServiceOrderPhotos(serviceOrderId);
}

export async function uploadServiceOrderPhoto(data: {
  serviceOrderId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  category: ServiceOrderPhotoCategory;
  notes?: string | null;
}) {
  const photo = await createServiceOrderPhoto(data);

  const categoryLabel = {
    ANTES: "Antes",
    DURANTE: "Durante",
    DEPOIS: "Depois",
  }[data.category];

  await registerServiceOrderEvent({
    serviceOrderId: data.serviceOrderId,
    type: "FOTO_ADICIONADA",
    title: "Foto adicionada",
    description: `${categoryLabel}: ${data.name}`,
  });

  return photo;
}

export async function removeServiceOrderPhoto(
  id: string
) {
  const photo =
    await findServiceOrderPhotoById(id);

  if (!photo) {
    throw new Error("Foto não encontrada.");
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