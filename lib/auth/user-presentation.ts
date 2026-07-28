export type UserPresentationInput = {
  displayName?: string | null;
  name?: string | null;
  email?: string | null;
  jobTitle?: string | null;
  role?: string | null;
};

export type UserPresentation = {
  displayName: string;
  firstName: string;
  initials: string;
  roleLabel: string | null;
};

function normalized(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ") || null;
}

function nameFromEmail(email?: string | null) {
  const localPart = normalized(email)?.split("@")[0] ?? "";
  const firstPart = localPart.split(/[._+-]+/).find(Boolean) ?? "";
  if (!firstPart) return null;
  return firstPart.charAt(0).toLocaleUpperCase("pt-BR") + firstPart.slice(1);
}

export function getUserInitials(name?: string | null) {
  const parts = normalized(name)?.split(" ").filter(Boolean) ?? [];
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("pt-BR");
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toLocaleUpperCase("pt-BR");
}

export function formatUserRole(role?: string | null) {
  const normalizedRole = normalized(role);
  if (!normalizedRole) return null;
  const knownRoles: Record<string, string> = {
    ADMIN: "Administrador",
    EXECUTIVO: "Executivo",
    GESTOR: "Gestor",
    OPERADOR: "Operador",
    CLIENTE: "Cliente",
  };
  return (
    knownRoles[normalizedRole] ??
    normalizedRole
      .replaceAll("_", " ")
      .toLocaleLowerCase("pt-BR")
      .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("pt-BR"))
  );
}

export function getUserPresentation(
  user: UserPresentationInput
): UserPresentation {
  const explicitName = normalized(user.displayName) ?? normalized(user.name);
  const emailName = nameFromEmail(user.email);
  const displayName = explicitName ?? normalized(user.email) ?? "Usuário";
  const firstName =
    explicitName?.split(" ")[0] ??
    emailName ??
    "Usuário";

  return {
    displayName,
    firstName,
    initials: getUserInitials(explicitName ?? emailName ?? displayName),
    roleLabel: normalized(user.jobTitle) ?? formatUserRole(user.role),
  };
}

export function getGreetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}
