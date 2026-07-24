import { redirect } from "next/navigation";

import { AuthenticationRequiredError } from "@/lib/auth/access-errors";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getCurrentUserAccess,
  requirePermission,
} from "@/services/auth.service";

export async function getCurrentAppUser() {
  try {
    return await getCurrentUserAccess();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/login");
    }
    throw error;
  }
}

export async function getCurrentCompanyId() {
  const user = await requirePermission(PERMISSIONS.DASHBOARD_COMMERCIAL);
  return user.companyId;
}
