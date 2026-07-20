import { prisma } from "@/lib/prisma";

export type CreateProjectTimelineData = {
  projectId: string;
  type: string;
  title: string;
  description?: string | null;
};

export async function createProjectTimeline(
  data: CreateProjectTimelineData
) {
  return prisma.projectTimeline.create({
    data: {
      projectId: data.projectId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
    },
  });
}

export async function findProjectTimelineData(
  projectId: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      companyId,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      timeline: {
        orderBy: {
          createdAt: "desc",
        },
      },
      financial: {
        select: {
          id: true,
          createdAt: true,
        },
      },
      serviceOrder: {
        select: {
          timeline: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
}
