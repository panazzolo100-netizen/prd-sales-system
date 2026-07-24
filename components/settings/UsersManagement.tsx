"use client";

import {
  ChevronLeft,
  ChevronRight,
  MailPlus,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Role = "EXECUTIVO" | "GESTOR" | "OPERADOR" | "CLIENTE";
type Status = "ATIVO" | "INATIVO" | "PENDENTE";
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  clientId: string | null;
  createdAt: string;
  status: Status;
  lastAccessAt: string | null;
  company: { id: string; name: string; tradeName: string | null };
  client: { id: string; name: string; document: string | null } | null;
};
type ClientOption = { id: string; name: string; document: string | null };
type ManagementData = {
  users: ManagedUser[];
  clients: ClientOption[];
  company: { id: string; name: string };
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  currentUserId: string;
};

const roleStyles: Record<Role, string> = {
  EXECUTIVO: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  GESTOR: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  OPERADOR: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  CLIENTE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};
const statusStyles: Record<Status, string> = {
  ATIVO: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  INATIVO: "border-red-500/30 bg-red-500/10 text-red-300",
  PENDENTE: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

export function UsersManagement() {
  const [data, setData] = useState<ManagementData | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<ManagedUser | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        ...(appliedSearch ? { search: appliedSearch } : {}),
      });
      const response = await fetch(`/api/settings/users?${params}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Erro ao listar usuários.");
      setData(body);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao listar usuários.");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => { void load(); }, [load]);

  async function action(
    url: string,
    options: RequestInit,
    success: string
  ) {
    setMessage("");
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Operação não concluída.");
    setMessage(success);
    await load();
  }

  async function status(user: ManagedUser, active: boolean) {
    try {
      await action("/api/settings/users", {
        method: "PATCH",
        body: JSON.stringify({ id: user.id, action: "status", active }),
      }, active ? "Usuário reativado." : "Usuário desativado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operação não concluída.");
    }
  }

  async function emailAction(user: ManagedUser, kind: "invite" | "reset-password") {
    try {
      await action("/api/settings/users", {
        method: "PATCH",
        body: JSON.stringify({ id: user.id, action: kind }),
      }, kind === "invite" ? "Convite enviado." : "E-mail de redefinição enviado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "E-mail não enviado.");
    }
  }

  async function remove(user: ManagedUser) {
    if (!window.confirm(`Excluir ${user.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      await action(`/api/settings/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      }, "Usuário excluído.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Usuário não excluído.");
    }
  }

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-zinc-900 to-violet-950/20 p-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Configurações</p>
          <h1 className="mt-2 text-4xl font-black">Gestão de Usuários</h1>
          <p className="mt-2 text-zinc-400">Acessos, perfis e clientes vinculados da empresa.</p>
        </div>
        <button onClick={() => setEditing("new")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold hover:bg-orange-600">
          <Plus size={18} /> Novo usuário
        </button>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setAppliedSearch(search.trim());
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por nome ou e-mail" className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-11 pr-4 outline-none focus:border-orange-500" />
          </div>
          <button className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:bg-zinc-800">Pesquisar</button>
          <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 hover:bg-zinc-800" aria-label="Atualizar">
            <RefreshCw size={18} />
          </button>
        </form>
        {message && <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">{message}</p>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="border-b border-white/[0.07] bg-black/20 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                {["Nome", "E-mail", "Empresa", "Perfil", "Cliente", "Status", "Último acesso", "Criado em", "Ações"].map((label) => (
                  <th key={label} className="px-5 py-4 font-bold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.025]">
                  <td className="px-5 py-4 font-bold text-white">{user.name}</td>
                  <td className="px-5 py-4 text-sm text-zinc-400">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-zinc-400">{user.company.tradeName ?? user.company.name}</td>
                  <td className="px-5 py-4"><Badge className={roleStyles[user.role]}>{user.role}</Badge></td>
                  <td className="px-5 py-4 text-sm text-zinc-400">{user.client?.name ?? "—"}</td>
                  <td className="px-5 py-4"><Badge className={statusStyles[user.status]}>{user.status}</Badge></td>
                  <td className="px-5 py-4 text-sm text-zinc-500">{formatDate(user.lastAccessAt)}</td>
                  <td className="px-5 py-4 text-sm text-zinc-500">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <IconButton title="Editar" onClick={() => setEditing(user)}><Pencil size={16} /></IconButton>
                      <IconButton title={user.status === "INATIVO" ? "Reativar" : "Desativar"} onClick={() => void status(user, user.status === "INATIVO")}>
                        {user.status === "INATIVO" ? <Power size={16} /> : <PowerOff size={16} />}
                      </IconButton>
                      <IconButton title="Redefinir senha" onClick={() => void emailAction(user, "reset-password")}><ShieldCheck size={16} /></IconButton>
                      <IconButton title="Enviar convite" onClick={() => void emailAction(user, "invite")}><MailPlus size={16} /></IconButton>
                      <IconButton title="Excluir" danger onClick={() => void remove(user)}><Trash2 size={16} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-10 text-center text-zinc-500">Carregando usuários...</div>}
        {!loading && data?.users.length === 0 && <div className="p-10 text-center text-zinc-500">Nenhum usuário encontrado.</div>}
        {data && (
          <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4 text-sm text-zinc-500">
            <span>{data.pagination.total} usuário(s)</span>
            <div className="flex items-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-zinc-700 p-2 disabled:opacity-30"><ChevronLeft size={17} /></button>
              <span>Página {data.pagination.page} de {data.pagination.totalPages}</span>
              <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-zinc-700 p-2 disabled:opacity-30"><ChevronRight size={17} /></button>
            </div>
          </div>
        )}
      </section>

      {editing && data && (
        <UserDialog
          user={editing === "new" ? null : editing}
          company={data.company}
          clients={data.clients}
          onClose={() => setEditing(null)}
          onSaved={async (text) => {
            setEditing(null);
            setMessage(text);
            await load();
          }}
        />
      )}
    </main>
  );
}

function UserDialog({
  user,
  company,
  clients,
  onClose,
  onSaved,
}: {
  user: ManagedUser | null;
  company: ManagementData["company"];
  clients: ClientOption[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [role, setRole] = useState<Role>(user?.role ?? "OPERADOR");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      ...(user ? { id: user.id } : {}),
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      role,
      clientId: role === "CLIENTE" ? String(form.get("clientId") ?? "") : null,
      ...(user ? { active: form.get("active") === "ATIVO" } : {}),
    };
    try {
      const response = await fetch("/api/settings/users", {
        method: user ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Usuário não salvo.");
      await onSaved(user ? "Usuário atualizado." : "Usuário criado e convite enviado.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Usuário não salvo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div><p className="text-sm font-bold uppercase tracking-wide text-orange-400">Acesso</p><h2 className="mt-1 text-2xl font-black">{user ? "Editar usuário" : "Novo usuário"}</h2></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"><X size={20} /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nome"><input name="name" defaultValue={user?.name ?? ""} required className={inputClass} /></Field>
          <Field label="E-mail"><input name="email" type="email" defaultValue={user?.email ?? ""} disabled={Boolean(user)} required className={inputClass} /></Field>
          <Field label="Perfil">
            <select name="role" value={role} onChange={(event) => setRole(event.target.value as Role)} className={inputClass}>
              <option value="EXECUTIVO">Executivo</option><option value="GESTOR">Gestor</option><option value="OPERADOR">Operador</option><option value="CLIENTE">Cliente</option>
            </select>
          </Field>
          <Field label="Empresa"><input value={company.name} readOnly className={`${inputClass} text-zinc-500`} /></Field>
          {role === "CLIENTE" && (
            <Field label="Cliente vinculado">
              <select name="clientId" defaultValue={user?.clientId ?? ""} required className={inputClass}>
                <option value="">Selecione...</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.document ? ` — ${client.document}` : ""}</option>)}
              </select>
            </Field>
          )}
          {user && (
            <Field label="Status">
              <select name="active" defaultValue={user.status === "INATIVO" ? "INATIVO" : "ATIVO"} className={inputClass}>
                <option value="ATIVO">Ativo</option><option value="INATIVO">Inativo</option>
              </select>
            </Field>
          )}
        </div>
        {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold">Cancelar</button>
          <button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 font-bold hover:bg-orange-600 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}
function IconButton({ title, children, onClick, danger = false }: { title: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} className={`rounded-lg p-2 transition ${danger ? "text-zinc-600 hover:bg-red-500/10 hover:text-red-400" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}>{children}</button>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-zinc-400">{label}</span>{children}</label>;
}
function formatDate(value: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
const inputClass = "h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-orange-500 disabled:opacity-60";
