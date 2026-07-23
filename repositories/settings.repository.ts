import { prisma } from "@/lib/prisma";

export function updateCompanySettings(companyId: string, data: { name: string; tradeName: string | null; document: string | null; email: string | null; phone: string | null; address: string | null; logoUrl: string | null }) {
  return prisma.company.update({ where: { id: companyId }, data });
}

export function updateUserProfile(userId: string, companyId: string, data: { name: string; jobTitle: string | null }) {
  return prisma.user.update({ where: { id: userId, companyId }, data });
}

export function updateUserPreferences(userId: string, companyId: string, data: { displayName: string | null; homePage: string; interfaceDensity: string }) {
  return prisma.user.update({ where: { id: userId, companyId }, data });
}
