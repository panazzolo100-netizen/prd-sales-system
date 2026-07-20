import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAppUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser?.email) {
    redirect("/login");
  }

  const appUser = await prisma.user.findUnique({
    where: {
      email: authUser.email,
    },
    include: {
      company: true,
    },
  });

  if (!appUser) {
    throw new Error(
      "Usuário autenticado, mas não cadastrado no ERP."
    );
  }

  return appUser;
}

export async function getCurrentCompanyId() {
  const user = await getCurrentAppUser();

  return user.companyId;
}