import { Sidebar } from "./Sidebar";
import { Topbar } from "./TopBar";
import { getCurrentUserAccess } from "@/services/auth.service";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserAccess();
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
}
