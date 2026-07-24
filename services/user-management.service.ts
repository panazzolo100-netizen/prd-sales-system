import type { User } from "@supabase/supabase-js";

import { AccessDeniedError } from "@/lib/auth/access-errors";
import { PERMISSIONS, USER_ROLES, type AppRole } from "@/lib/auth/permissions";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  countCompanyExecutives,
  createManagedUser,
  deleteManagedUser,
  findAvailableClients,
  findCompanyClient,
  findManagedUser,
  findManagedUserByEmail,
  listManagedUsers,
  updateManagedUser,
} from "@/repositories/user-management.repository";
import { requirePermission } from "@/services/auth.service";

const PAGE_SIZE_MAX = 50;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function parseRole(value: string): AppRole {
  if (!USER_ROLES.includes(value as AppRole)) {
    throw new Error("Perfil inválido.");
  }
  return value as AppRole;
}

function redirectUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return base ? `${base}/redefinir-senha` : undefined;
}

async function listAllAuthUsers() {
  const admin = createSupabaseAdmin();
  const users: User[] = [];
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Supabase Auth: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 1000) break;
    page += 1;
  }
  return users;
}

function authStatus(user: User | undefined) {
  if (!user) return "PENDENTE" as const;
  const bannedUntil = user.banned_until ? new Date(user.banned_until) : null;
  return bannedUntil && bannedUntil > new Date()
    ? ("INATIVO" as const)
    : ("ATIVO" as const);
}

async function validateClient(
  companyId: string,
  role: AppRole,
  clientId?: string | null
) {
  if (role !== "CLIENTE") return null;
  if (!clientId) throw new Error("Selecione o cliente vinculado.");
  if (!(await findCompanyClient(clientId, companyId))) {
    throw new AccessDeniedError("O cliente não pertence à empresa autenticada.");
  }
  return clientId;
}

async function findAuthUserByEmail(email: string) {
  return (await listAllAuthUsers()).find(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  );
}

async function assertCanRemoveExecutive(input: {
  currentUserId: string;
  targetId: string;
  companyId: string;
  targetRole: AppRole;
}) {
  if (input.targetRole !== "EXECUTIVO") return;
  const executives = await countCompanyExecutives(input.companyId);
  if (executives <= 1) {
    throw new Error(
      input.currentUserId === input.targetId
        ? "Você não pode remover seu próprio acesso enquanto for o último executivo da empresa."
        : "A empresa deve manter pelo menos um executivo."
    );
  }
}

export async function getUserManagementData(input: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const current = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Math.trunc(input.pageSize ?? 10))
  );
  const [{ users, total }, clients, authUsers] = await Promise.all([
    listManagedUsers({
      companyId: current.companyId,
      search: input.search?.trim() || undefined,
      page,
      pageSize,
    }),
    findAvailableClients(current.companyId),
    listAllAuthUsers(),
  ]);
  const authByEmail = new Map(
    authUsers.map((user) => [user.email?.toLowerCase(), user])
  );
  return {
    users: users.map((user) => {
      const authUser = authByEmail.get(user.email.toLowerCase());
      return {
        ...user,
        status: authStatus(authUser),
        lastAccessAt: authUser?.last_sign_in_at ?? null,
      };
    }),
    clients,
    company: {
      id: current.company.id,
      name: current.company.tradeName ?? current.company.name,
    },
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    currentUserId: current.id,
  };
}

export async function createCompanyUser(input: {
  name: string;
  email: string;
  role: string;
  clientId?: string | null;
}) {
  const current = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const role = parseRole(input.role);
  if (!name) throw new Error("Informe o nome.");
  if (!email || !email.includes("@")) throw new Error("Informe um e-mail válido.");
  if (await findManagedUserByEmail(email)) {
    throw new Error("Já existe um usuário com este e-mail.");
  }
  if (await findAuthUserByEmail(email)) {
    throw new Error("Já existe um usuário no Supabase Auth com este e-mail.");
  }
  const clientId = await validateClient(current.companyId, role, input.clientId);
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name, role, companyId: current.companyId },
    redirectTo: redirectUrl(),
  });
  if (error || !data.user) {
    throw new Error(`Não foi possível enviar o convite: ${error?.message ?? "erro desconhecido"}`);
  }
  try {
    return await createManagedUser({
      name,
      email,
      role,
      companyId: current.companyId,
      clientId,
    });
  } catch (error) {
    await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
    throw error;
  }
}

export async function updateCompanyUser(input: {
  id: string;
  name: string;
  role: string;
  clientId?: string | null;
  active?: boolean;
}) {
  const current = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const target = await findManagedUser(input.id, current.companyId);
  if (!target) throw new Error("Usuário não encontrado.");
  const role = parseRole(input.role);
  const name = input.name.trim();
  if (!name) throw new Error("Informe o nome.");
  if (target.role === "EXECUTIVO" && role !== "EXECUTIVO") {
    await assertCanRemoveExecutive({
      currentUserId: current.id,
      targetId: target.id,
      companyId: current.companyId,
      targetRole: target.role,
    });
  }
  const clientId = await validateClient(current.companyId, role, input.clientId);
  const updated = await updateManagedUser(target.id, current.companyId, {
    name,
    role,
    clientId,
  });
  if (typeof input.active === "boolean") {
    await setCompanyUserActive(target.id, input.active);
  }
  return updated;
}

export async function setCompanyUserActive(id: string, active: boolean) {
  const current = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const target = await findManagedUser(id, current.companyId);
  if (!target) throw new Error("Usuário não encontrado.");
  if (!active && target.role === "EXECUTIVO") {
    await assertCanRemoveExecutive({
      currentUserId: current.id,
      targetId: target.id,
      companyId: current.companyId,
      targetRole: target.role,
    });
  }
  const authUser = await findAuthUserByEmail(target.email);
  if (!authUser) throw new Error("Usuário não encontrado no Supabase Auth.");
  const { error } = await createSupabaseAdmin().auth.admin.updateUserById(
    authUser.id,
    { ban_duration: active ? "none" : "876000h" }
  );
  if (error) throw new Error(`Supabase Auth: ${error.message}`);
  return { success: true };
}

export async function sendCompanyUserPasswordEmail(id: string) {
  const current = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const target = await findManagedUser(id, current.companyId);
  if (!target) throw new Error("Usuário não encontrado.");
  const { error } = await createSupabaseAdmin().auth.resetPasswordForEmail(
    target.email,
    { redirectTo: redirectUrl() }
  );
  if (error) throw new Error(`Não foi possível enviar o e-mail: ${error.message}`);
  return { success: true };
}

export async function removeCompanyUser(id: string) {
  const current = await requirePermission(PERMISSIONS.ADMINISTRATION);
  const target = await findManagedUser(id, current.companyId);
  if (!target) throw new Error("Usuário não encontrado.");
  if (target.id === current.id) {
    throw new Error("Você não pode excluir o próprio usuário.");
  }
  await assertCanRemoveExecutive({
    currentUserId: current.id,
    targetId: target.id,
    companyId: current.companyId,
    targetRole: target.role,
  });
  if (
    target._count.leads > 0 ||
    target._count.activities > 0 ||
    target._count.projectDocuments > 0
  ) {
    throw new Error("O usuário possui registros vinculados e não pode ser excluído.");
  }
  const authUser = await findAuthUserByEmail(target.email);
  if (authUser) {
    const { error } = await createSupabaseAdmin().auth.admin.deleteUser(authUser.id);
    if (error) throw new Error(`Supabase Auth: ${error.message}`);
  }
  const deleted = await deleteManagedUser(target.id, current.companyId);
  if (!deleted) {
    throw new Error("O usuário recebeu novos vínculos e não pode ser excluído.");
  }
  return { success: true };
}
