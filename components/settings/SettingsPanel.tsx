"use client";

import { Building2, CheckCircle2, Loader2, Settings2, ShieldCheck, UserRound, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Tab = "empresa" | "perfil" | "preferencias" | "seguranca";
type Props = {
  user: { name: string; email: string; role: string; jobTitle: string | null; displayName: string | null; homePage: string; interfaceDensity: string };
  company: { name: string; tradeName: string | null; document: string | null; email: string | null; phone: string | null; address: string | null; logoUrl: string | null };
};
const tabs: { value: Tab; label: string }[] = [{ value: "empresa", label: "Empresa" }, { value: "perfil", label: "Perfil" }, { value: "preferencias", label: "Preferências" }, { value: "seguranca", label: "Segurança" }];

export function SettingsPanel({ user, company }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("aba") as Tab | null;
  const activeTab: Tab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab! : "empresa";
  const [saving, setSaving] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function selectTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("aba", tab);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }
  async function submit(section: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(section); setToast(null);
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, ...data }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar.");
      setToast({ type: "success", text: "Alterações salvas e persistidas com sucesso." });
      router.refresh();
    } catch (error) {
      setToast({ type: "error", text: error instanceof Error ? error.message : "Não foi possível salvar." });
    } finally { setSaving(""); }
  }

  return <>
    <nav aria-label="Seções das configurações" className="sticky top-[92px] z-10 flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.07] bg-zinc-950/90 p-2 backdrop-blur-xl">
      {tabs.map((tab) => <button key={tab.value} type="button" onClick={() => selectTab(tab.value)} aria-current={activeTab === tab.value ? "page" : undefined} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab.value ? "bg-orange-500 font-bold text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}>{tab.label}</button>)}
    </nav>
    {activeTab === "empresa" && <form onSubmit={(event) => submit("company", event)} className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6"><Header icon={Building2} title="Empresa" text="Dados administrativos e identidade da empresa." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Nome da empresa" name="name" defaultValue={company.name} required /><Field label="Nome comercial" name="tradeName" defaultValue={company.tradeName ?? ""} /><Field label="Documento" name="document" defaultValue={company.document ?? ""} /><Field label="E-mail" name="email" type="email" defaultValue={company.email ?? ""} /><Field label="Telefone" name="phone" defaultValue={company.phone ?? ""} /><Field label="Endereço" name="address" defaultValue={company.address ?? ""} /><div className="sm:col-span-2"><Field label="URL da logo" name="logoUrl" type="url" defaultValue={company.logoUrl ?? ""} /></div></div><Save loading={saving === "company"} text="Salvar empresa" /></form>}
    {activeTab === "perfil" && <form onSubmit={(event) => submit("profile", event)} className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6"><Header icon={UserRound} title="Perfil" text="Informações exibidas dentro do ERP." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Nome do usuário" name="name" defaultValue={user.name} required /><Field label="E-mail" type="email" defaultValue={user.email} disabled /><Field label="Cargo ou função" name="jobTitle" defaultValue={user.jobTitle ?? ""} /><ReadOnly label="Papel atual" value={user.role.replaceAll("_", " ")} /></div><Save loading={saving === "profile"} text="Salvar perfil" /></form>}
    {activeTab === "preferencias" && <form onSubmit={(event) => submit("preferences", event)} className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6"><Header icon={Settings2} title="Preferências" text="Personalize informações e comportamento da interface." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Nome exibido" name="displayName" defaultValue={user.displayName ?? user.name} /><SelectField label="Tela inicial" name="homePage" defaultValue={user.homePage} options={[["/", "Dashboard"], ["/leads", "Oportunidades"], ["/pipeline", "Pipeline"], ["/agenda", "Agenda"], ["/engenharia", "Engenharia"], ["/financeiro", "Financeiro"]]} /><SelectField label="Densidade da interface" name="interfaceDensity" defaultValue={user.interfaceDensity} options={[["COMFORTABLE", "Confortável"], ["COMPACT", "Compacta"]]} /></div><Save loading={saving === "preferences"} text="Salvar preferências" /></form>}
    {activeTab === "seguranca" && <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6"><Header icon={ShieldCheck} title="Segurança" text="Acesso e autenticação protegidos pelo Supabase Auth." /><div className="mt-6 grid gap-4 sm:grid-cols-3"><ReadOnly label="E-mail de acesso" value={user.email} /><ReadOnly label="Papel atual" value={user.role.replaceAll("_", " ")} /><ReadOnly label="Empresa vinculada" value={company.tradeName ?? company.name} /></div><Link href={`/esqueci-minha-senha?email=${encodeURIComponent(user.email)}`} className="mt-6 inline-flex h-11 items-center rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600">Alterar senha</Link></section>}
    {toast && <div role={toast.type === "error" ? "alert" : "status"} className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-xl border px-5 py-4 text-sm font-semibold shadow-2xl ${toast.type === "success" ? "border-emerald-500/30 bg-emerald-950 text-emerald-300" : "border-red-500/30 bg-red-950 text-red-300"}`}>{toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{toast.text}</div>}
  </>;
}
function Header({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) { return <div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><Icon size={21} /></div><div><h2 className="text-xl font-bold text-white">{title}</h2><p className="mt-1 text-sm text-zinc-500">{text}</p></div></div>; }
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="block text-sm font-semibold text-zinc-400">{label}<input {...props} className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-orange-500/60 disabled:opacity-50" /></label>; }
function SelectField({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: [string, string][] }) { return <label className="block text-sm font-semibold text-zinc-400">{label}<select {...props} className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-orange-500/60">{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }
function ReadOnly({ label, value }: { label: string; value: string }) { return <div><p className="text-sm font-semibold text-zinc-500">{label}</p><p className="mt-2 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm font-semibold text-white">{value}</p></div>; }
function Save({ loading, text }: { loading: boolean; text: string }) { return <button type="submit" disabled={loading} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="animate-spin" size={17} />}{loading ? "Salvando..." : text}</button>; }
