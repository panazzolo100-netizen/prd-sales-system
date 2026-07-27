import {
  type Permission,
  PERMISSIONS,
} from "@/lib/auth/permissions";

const PAGE_PERMISSIONS: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/configuracoes", permission: PERMISSIONS.ADMINISTRATION },
  { prefix: "/financeiro", permission: PERMISSIONS.FINANCIAL },
  { prefix: "/projetos", permission: PERMISSIONS.PROJECTS },
  { prefix: "/engenharia", permission: PERMISSIONS.ENGINEERING },
  { prefix: "/os", permission: PERMISSIONS.SERVICE_ORDERS_INTERNAL },
  { prefix: "/relatorios", permission: PERMISSIONS.REPORTS },
  { prefix: "/agenda", permission: PERMISSIONS.AGENDA },
  { prefix: "/leads", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/pipeline", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/clientes", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/propostas", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/notificacoes", permission: PERMISSIONS.DASHBOARD_COMMERCIAL },
  { prefix: "/", permission: PERMISSIONS.DASHBOARD_COMMERCIAL },
];

function matches(pathname: string, prefix: string) {
  return (
    pathname === prefix ||
    (prefix !== "/" && pathname.startsWith(`${prefix}/`))
  );
}

export function getPagePermission(pathname: string) {
  return PAGE_PERMISSIONS.find(({ prefix }) => matches(pathname, prefix))
    ?.permission;
}
