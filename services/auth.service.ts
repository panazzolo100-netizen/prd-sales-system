import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";

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

async function loadCurrentUserAccess() {
  const requestHeaders = await headers();
  let email = requestHeaders.get(
    "x-prd-auth-email"
  );

  if (!email) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser?.email) {
      throw new AuthenticationRequiredError();
    }

    email = authUser.email;
  }

  const user =
    await findUserAccessByEmail(email);

  if (!user) {
    throw new AuthenticationRequiredError(
      "Usuário autenticado, mas não cadastrado no ERP."
    );
  }

  if (
    user.role === "CLIENTE" &&
    !user.clientId
  ) {
    throw new AccessDeniedError(
      "O usuário cliente ainda não está vinculado a um cliente."
    );
  }

  return {
    ...user,
    role: user.role as AppRole,
  };
}

// React limpa este cache entre requisições e o compartilha
// durante a renderização atual, incluindo layouts, páginas e services.
export const getCurrentUserAccess = cache(
  loadCurrentUserAccess
);

function assertFirstAccessCompleted(
  user: Awaited<
    ReturnType<typeof getCurrentUserAccess>
  >
) {
  if (user.forcePasswordChange) {
    throw new AccessDeniedError(
      "Troque a senha temporária antes de acessar o sistema."
    );
  }
}

export async function requirePermission(
  permission: Permission
) {
  const user = await getCurrentUserAccess();

  assertFirstAccessCompleted(user);

  if (!hasPermission(user.role, permission)) {
    throw new AccessDeniedError();
  }

  return user;
}

export async function requireRole(
  ...roles: AppRole[]
) {
  const user = await getCurrentUserAccess();

  assertFirstAccessCompleted(user);

  if (!roles.includes(user.role)) {
    throw new AccessDeniedError();
  }

  return user;
}

export async function requirePagePermission(
  permission: Permission
) {
  try {
    const user =
      await getCurrentUserAccess();

    if (user.forcePasswordChange) {
      redirect("/primeiro-acesso");
    }

    if (
      !hasPermission(
        user.role,
        permission
      )
    ) {
      redirect(
        getDefaultRoute(user.role)
      );
    }

    return user;
  } catch (error) {
    if (
      error instanceof
      AuthenticationRequiredError
    ) {
      redirect("/login");
    }

    if (
      error instanceof AccessDeniedError
    ) {
      const user =
        await getCurrentUserAccess();

      if (user.forcePasswordChange) {
        redirect("/primeiro-acesso");
      }

      redirect(
        getDefaultRoute(user.role)
      );
    }

    throw error;
  }
}