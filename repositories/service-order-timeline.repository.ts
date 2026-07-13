import { prisma } from "@/lib/prisma";

type CreateServiceOrderTimelineData = {
  serviceOrderId: string;
  type: string;
  title: string;
  description?: string | null;
};

export async function createServiceOrderTimeline(
  data: CreateServiceOrderTimelineData
) {
  return prisma.serviceOrderTimeline.create({
    data: {
      serviceOrderId: data.serviceOrderId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
    },
  });
}

export async function findServiceOrderTimeline(
  serviceOrderId: string
) {
  return prisma.serviceOrderTimeline.findMany({
    where: {
      serviceOrderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}