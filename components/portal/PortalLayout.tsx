"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, LogOut } from "lucide-react";

import { CompanyLogo } from "@/components/layout/CompanyLogo";
import { createClient } from "@/lib/supabase/client";

export function PortalLayout({
  children,
  clientName,
}: {
  children: React.ReactNode;
  clientName: string;
}) {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/[0.07] bg-[#0b0b0d]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/portal"><CompanyLogo collapsed={false} /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-400 sm:inline">{clientName}</span>
            <Link href="/portal" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold">
              <ClipboardList size={17} /> Minhas OS
            </Link>
            <button onClick={logout} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white" aria-label="Sair">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </main>
  );
}
