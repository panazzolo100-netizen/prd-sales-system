import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/esqueci-minha-senha",
  "/redefinir-senha",
  "/api/health",
];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function timedResponse(
  response: NextResponse,
  startedAt: number,
  authDuration: number
) {
  response.headers.set(
    "Server-Timing",
    `middleware;dur=${(performance.now() - startedAt).toFixed(1)}, auth;dur=${authDuration.toFixed(1)}`
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const startedAt = performance.now();
  const requestHeaders = new Headers(request.headers);

  // Never trust identity headers supplied by the browser. Only middleware can
  // populate these values after Supabase has verified the session.
  requestHeaders.delete("x-prd-auth-email");
  requestHeaders.set("x-prd-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
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

  const authStartedAt = performance.now();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authDuration = performance.now() - authStartedAt;
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((route) => matches(pathname, route));

  if (!user?.email) {
    if (isPublic) {
      return timedResponse(response, startedAt, authDuration);
    }
    if (pathname.startsWith("/api/")) {
      return timedResponse(
        NextResponse.json({ error: "Autenticação necessária." }, { status: 401 }),
        startedAt,
        authDuration
      );
    }
    return timedResponse(
      NextResponse.redirect(new URL("/login", request.url)),
      startedAt,
      authDuration
    );
  }

  requestHeaders.set("x-prd-auth-email", user.email);
  const authenticatedResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.getAll().forEach((cookie) =>
    authenticatedResponse.cookies.set(cookie)
  );

  return timedResponse(authenticatedResponse, startedAt, authDuration);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
