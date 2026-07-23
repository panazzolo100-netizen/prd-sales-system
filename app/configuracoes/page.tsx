import { Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { PageHeader } from "@/components/ui/erp";
import { getCurrentAppUser } from "@/lib/auth/current-user";

export default async function SettingsPage() {
  const user = await getCurrentAppUser();
  return <AppLayout><main className="space-y-8"><PageHeader eyebrow="Administração" title="Configurações" description="Gerencie os dados da empresa, seu perfil e as preferências da plataforma." /><Suspense><SettingsPanel user={{ name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle, displayName: user.displayName, homePage: user.homePage, interfaceDensity: user.interfaceDensity }} company={{ name: user.company.name, tradeName: user.company.tradeName, document: user.company.document, email: user.company.email, phone: user.company.phone, address: user.company.address, logoUrl: user.company.logoUrl }} /></Suspense></main></AppLayout>;
}
