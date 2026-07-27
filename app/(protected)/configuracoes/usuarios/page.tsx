import { UsersManagement } from "@/components/settings/UsersManagement";
import { AppLayout } from "@/components/layout/AppLayout";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePagePermission } from "@/services/auth.service";

export default async function UsersManagementPage() {
  await requirePagePermission(PERMISSIONS.ADMINISTRATION);
  return (
    <AppLayout>
      <UsersManagement />
    </AppLayout>
  );
}
