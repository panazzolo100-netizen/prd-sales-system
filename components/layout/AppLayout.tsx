import { Sidebar } from "./Sidebar";
import { Topbar } from "./TopBar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-[#09090B] text-white">
      <Sidebar />

      <section className="min-w-0 flex-1">
        <Topbar />

        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>
    </main>
  );
}
