export const USER_ROLES = ["EXECUTIVO", "GESTOR", "OPERADOR", "CLIENTE"] as const;
export type AppRole = (typeof USER_ROLES)[number];

export const PERMISSIONS = {
  DASHBOARD_BUSINESS: "dashboard.business",
  DASHBOARD_COMMERCIAL: "dashboard.commercial",
  COMMERCIAL: "commercial",
  ENGINEERING: "engineering",
  PROJECTS: "projects",
  SERVICE_ORDERS_INTERNAL: "service-orders.internal",
  FINANCIAL: "financial",
  AGENDA: "agenda",
  REPORTS: "reports",
  ADMINISTRATION: "administration",
  CLIENT_PORTAL: "client.portal",
  CLIENT_SERVICE_ORDERS: "client.service-orders",
  CLIENT_SIGN_SERVICE_ORDER: "client.sign-service-order",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<Permission>> = {
  EXECUTIVO: new Set(
    Object.values(PERMISSIONS).filter(
      (permission) => permission !== PERMISSIONS.CLIENT_PORTAL
    )
  ),
  GESTOR: new Set([
    PERMISSIONS.DASHBOARD_BUSINESS,
    PERMISSIONS.DASHBOARD_COMMERCIAL,
    PERMISSIONS.COMMERCIAL,
    PERMISSIONS.ENGINEERING,
    PERMISSIONS.PROJECTS,
    PERMISSIONS.SERVICE_ORDERS_INTERNAL,
    PERMISSIONS.FINANCIAL,
    PERMISSIONS.AGENDA,
    PERMISSIONS.REPORTS,
    PERMISSIONS.CLIENT_SERVICE_ORDERS,
    PERMISSIONS.CLIENT_SIGN_SERVICE_ORDER,
  ]),
  OPERADOR: new Set([
    PERMISSIONS.DASHBOARD_COMMERCIAL,
    PERMISSIONS.COMMERCIAL,
  ]),
  CLIENTE: new Set([
    PERMISSIONS.CLIENT_PORTAL,
    PERMISSIONS.CLIENT_SERVICE_ORDERS,
    PERMISSIONS.CLIENT_SIGN_SERVICE_ORDER,
  ]),
};

export function hasPermission(role: AppRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].has(permission);
}

export const canAccessModule = hasPermission;

export function getDefaultRoute(role: AppRole) {
  return role === "CLIENTE" ? "/portal" : "/";
}

export function getRolePermissions(role: AppRole) {
  return [...ROLE_PERMISSIONS[role]];
}
