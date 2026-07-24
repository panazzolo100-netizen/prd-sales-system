import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import { updateCompanySettings, updateUserPreferences, updateUserProfile } from "@/repositories/settings.repository";

export async function saveCompanySettings(data: { name: string; tradeName?: string | null; document?: string | null; email?: string | null; phone?: string | null; address?: string | null; logoUrl?: string | null }) {
  const user = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const name = data.name.trim();
  if (!name) throw new Error("Informe o nome da empresa.");
  return updateCompanySettings(user.companyId, { name, tradeName: data.tradeName?.trim() || null, document: data.document?.trim() || null, email: data.email?.trim() || null, phone: data.phone?.trim() || null, address: data.address?.trim() || null, logoUrl: data.logoUrl?.trim() || null });
}

export async function saveUserProfile(data: { name: string; jobTitle?: string | null }) {
  const user = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const name = data.name.trim();
  if (!name) throw new Error("Informe o nome do usuário.");
  return updateUserProfile(user.id, user.companyId, { name, jobTitle: data.jobTitle?.trim() || null });
}

export async function saveUserPreferences(data: { displayName?: string | null; homePage?: string; interfaceDensity?: string }) {
  const user = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const allowedHomePages = ["/", "/leads", "/pipeline", "/agenda", "/engenharia", "/financeiro"];
  const homePage = allowedHomePages.includes(data.homePage ?? "") ? data.homePage! : "/";
  const interfaceDensity = data.interfaceDensity === "COMPACT" ? "COMPACT" : "COMFORTABLE";
  return updateUserPreferences(user.id, user.companyId, { displayName: data.displayName?.trim() || null, homePage, interfaceDensity });
}
