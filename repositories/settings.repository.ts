import { prisma } from "@/lib/prisma";

type UpdateCompanySettingsData = {
  name: string;
  tradeName?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
};

type UpdateUserProfileData = {
  name: string;
  jobTitle?: string | null;
};

type UpdateUserPreferencesData = {
  displayName?: string | null;
  homePage: string;
  interfaceDensity:
    | "COMPACT"
    | "COMFORTABLE";
};

export function updateCompanySettings(
  companyId: string,
  data: UpdateCompanySettingsData
) {
  return prisma.company.update({
    where: {
      id: companyId,
    },
    data: {
      name: data.name,
      tradeName: data.tradeName,
      document: data.document,
      email: data.email,
      phone: data.phone,
      address: data.address,
      logoUrl: data.logoUrl,
    },
  });
}

export function updateUserProfile(
  userId: string,
  companyId: string,
  data: UpdateUserProfileData
) {
  return prisma.user.update({
    where: {
      id: userId,
      companyId,
    },
    data: {
      name: data.name,
      jobTitle: data.jobTitle,
    },
  });
}

export function updateUserPreferences(
  userId: string,
  companyId: string,
  data: UpdateUserPreferencesData
) {
  return prisma.user.update({
    where: {
      id: userId,
      companyId,
    },
    data: {
      displayName: data.displayName,
      homePage: data.homePage,
      interfaceDensity:
        data.interfaceDensity,
    },
  });
}