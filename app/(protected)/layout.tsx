import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/TopBar";
import { AccessDeniedError, AuthenticationRequiredError } from "@/lib/auth/access-errors";
import { getDefaultRoute, hasPermission } from "@/lib/auth/permissions";
import { getPagePermission } from "@/lib/auth/route-permissions";
import { getCurrentUserAccess } from "@/services/auth.service";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const [user, requestHeaders] = await Promise.all([
      getCurrentUserAccess(),
      headers(),
    ]);
    const permission = getPagePermission(
      requestHeaders.get("x-prd-pathname") ?? "/"
    );

    if (permission && !hasPermission(user.role, permission)) {
      redirect(getDefaultRoute(user.role));
    }

    return (
      <main className="flex min-h-screen bg-[#09090B] text-white">
        <Sidebar role={user.role} name={user.displayName ?? user.name} />
        <section className="min-w-0 flex-1">
          <Topbar role={user.role} />
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/login");
    }
    if (error instanceof AccessDeniedError) {
      redirect("/login");
    }
    throw error;
  }
}
