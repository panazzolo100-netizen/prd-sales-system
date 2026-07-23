import { prisma } from "@/lib/prisma";
import { ServiceOrderPhotoCategory } from "@/lib/generated/prisma/enums";

type CreateServiceOrderPhotoData = {
  serviceOrderId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  category: ServiceOrderPhotoCategory;
  notes?: string | null;
};

export async function createServiceOrderPhoto(
  data: CreateServiceOrderPhotoData
) {
  return prisma.serviceOrderPhoto.create({
    data: {
      serviceOrderId: data.serviceOrderId,
      name: data.name,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      category: data.category,
      notes: data.notes ?? null,
    },
  });
}

export async function findServiceOrderPhotos(
  serviceOrderId: string,
  companyId: string
) {
  return prisma.serviceOrderPhoto.findMany({
    where: {
      serviceOrderId,
      serviceOrder: { companyId },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findServiceOrderPhotoById(
  id: string,
  companyId: string
) {
  return prisma.serviceOrderPhoto.findFirst({
    where: { id, serviceOrder: { companyId } },
  });
}

export async function deleteServiceOrderPhoto(
  id: string
) {
  return prisma.serviceOrderPhoto.delete({
    where: {
      id,
    },
  });
}

export async function findCompanyServiceOrderForPhoto(serviceOrderId: string, companyId: string) {
  return prisma.serviceOrder.findFirst({ where: { id: serviceOrderId, companyId }, select: { id: true } });
}
