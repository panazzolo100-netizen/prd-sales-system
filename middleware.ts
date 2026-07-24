import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  type AppRole,
  type Permission,
  PERMISSIONS,
  getDefaultRoute,
  hasPermission,
} from "@/lib/auth/permissions";

const PUBLIC_ROUTES = [
  "/login",
  "/esqueci-minha-senha",
  "/redefinir-senha",
  "/api/health",
  "/api/access",
];

const ROUTE_PERMISSIONS: Array<{
  prefix: string;
  permission: Permission;
}> = [
  { prefix: "/api/settings", permission: PERMISSIONS.ADMINISTRATION },
  { prefix: "/configuracoes", permission: PERMISSIONS.ADMINISTRATION },
  { prefix: "/api/financial", permission: PERMISSIONS.FINANCIAL },
  { prefix: "/financeiro", permission: PERMISSIONS.FINANCIAL },
  { prefix: "/api/projects", permission: PERMISSIONS.PROJECTS },
  { prefix: "/projetos", permission: PERMISSIONS.PROJECTS },
  { prefix: "/api/leads/engineering", permission: PERMISSIONS.ENGINEERING },
  { prefix: "/api/leads/dimensioning", permission: PERMISSIONS.ENGINEERING },
  { prefix: "/engenharia", permission: PERMISSIONS.ENGINEERING },
  { prefix: "/api/os", permission: PERMISSIONS.SERVICE_ORDERS_INTERNAL },
  { prefix: "/os", permission: PERMISSIONS.SERVICE_ORDERS_INTERNAL },
  { prefix: "/relatorios", permission: PERMISSIONS.REPORTS },
  { prefix: "/api/agenda", permission: PERMISSIONS.AGENDA },
  { prefix: "/agenda", permission: PERMISSIONS.AGENDA },
  { prefix: "/api/leads", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/api/clients", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/api/proposals", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/leads", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/pipeline", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/clientes", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/propostas", permission: PERMISSIONS.COMMERCIAL },
  { prefix: "/api/search", permission: PERMISSIONS.DASHBOARD_COMMERCIAL },
  { prefix: "/api/notifications", permission: PERMISSIONS.DASHBOARD_COMMERCIAL },
  { prefix: "/", permission: PERMISSIONS.DASHBOARD_COMMERCIAL },
];

function matches(pathname: string, prefix: string) {
  return (
    pathname === prefix ||
    (prefix !== "/" && pathname.startsWith(`${prefix}/`))
  );
}

async function findAppAccess(request: NextRequest) {
  const url = new URL("/api/access", request.url);
  const response = await fetch(url, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!response.ok) return null;

  return (await response.json()) as {
    role: AppRole;
    clientConfigured: boolean;
  };
}

function forbidden(request: NextRequest, role: AppRole) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Você não tem permissão para acessar este recurso." },
      { status: 403 }
    );
  }
  return NextResponse.redirect(
    new URL(getDefaultRoute(role), request.url)
  );
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((route) => matches(pathname, route));

  if (!authUser?.email) {
    if (isPublic) return response;
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Autenticação necessária." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/api/access") return response;

  const access = await findAppAccess(request);
  if (!access || (access.role === "CLIENTE" && !access.clientConfigured)) {
    return pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Acesso não configurado." }, { status: 403 })
      : NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    return NextResponse.redirect(
      new URL(getDefaultRoute(access.role), request.url)
    );
  }

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    return hasPermission(access.role, PERMISSIONS.CLIENT_PORTAL)
      ? response
      : forbidden(request, access.role);
  }
  if (pathname.startsWith("/api/portal/")) {
    return hasPermission(access.role, PERMISSIONS.CLIENT_PORTAL)
      ? response
      : forbidden(request, access.role);
  }

  const rule = ROUTE_PERMISSIONS.find(({ prefix }) => matches(pathname, prefix));
  if (rule && !hasPermission(access.role, rule.permission)) {
    return forbidden(request, access.role);
  }
  if (pathname.startsWith("/api/") && !rule && !isPublic) {
    return forbidden(request, access.role);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
