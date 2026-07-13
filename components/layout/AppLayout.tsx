import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-[#09090B] text-white">
      <Sidebar />

      <section className="flex-1">
        <Topbar />

        <div className="p-8">
          {children}
        </div>
      </section>
    </main>
  );
}