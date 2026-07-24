import { redirect } from "next/navigation";

import {
  AccessDeniedError,
  AuthenticationRequiredError,
} from "@/lib/auth/access-errors";
import {
  type AppRole,
  type Permission,
  getDefaultRoute,
  hasPermission,
} from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { findUserAccessByEmail } from "@/repositories/users.repository";

export async function getCurrentUserAccess() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser?.email) {
    throw new AuthenticationRequiredError();
  }

  const user = await findUserAccessByEmail(authUser.email);
  if (!user) {
    throw new AuthenticationRequiredError(
      "Usuário autenticado, mas não cadastrado no ERP."
    );
  }
  if (user.role === "CLIENTE" && !user.clientId) {
    throw new AccessDeniedError(
      "O usuário cliente ainda não está vinculado a um cliente."
    );
  }

  return { ...user, role: user.role as AppRole };
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUserAccess();
  if (!hasPermission(user.role, permission)) {
    throw new AccessDeniedError();
  }
  return user;
}

export async function requireRole(...roles: AppRole[]) {
  const user = await getCurrentUserAccess();
  if (!roles.includes(user.role)) {
    throw new AccessDeniedError();
  }
  return user;
}

export async function requirePagePermission(permission: Permission) {
  try {
    return await requirePermission(permission);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/login");
    }
    if (error instanceof AccessDeniedError) {
      const user = await getCurrentUserAccess();
      redirect(getDefaultRoute(user.role));
    }
    throw error;
  }
}
