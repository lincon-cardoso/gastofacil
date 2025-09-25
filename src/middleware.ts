import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";

// Middleware de autenticação e proteção de rotas

const CSRF_SECRET = process.env.CSRF_SECRET || "default-secret";

// Função para verificar tokens CSRF
function verifyCsrfToken(token: string, secret: string): boolean {
  const expectedToken = crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expectedToken), Buffer.from(token));
}

// Função para configurar CSP
function applyCSP(response: NextResponse) {
  const CSP_DEV =
    "default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'none';";

  const CSP_PROD =
    "default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'none';";

  const csp = process.env.NODE_ENV === "development" ? CSP_DEV : CSP_PROD;
  response.headers.set("Content-Security-Policy", csp);
}

// Função para configurar cabeçalhos de segurança manualmente
function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  // Cabeçalho X-XSS-Protection removido, pois é obsoleto em navegadores modernos
}

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  // Só executa autenticação se necessário
  if (!isLoginPage && !isProtectedRoute) {
    const response = NextResponse.next();
    applyCSP(response);
    applySecurityHeaders(response);
    return response;
  }

  try {
    // --- Proteção contra CSRF ---
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "DELETE"
    ) {
      const csrfToken = req.headers.get("x-csrf-token") || "";
      if (!verifyCsrfToken(csrfToken, CSRF_SECRET)) {
        return new NextResponse("CSRF token inválido ou ausente", {
          status: 403,
        });
      }
    }

    // --- Autenticação ---
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

    // --- Redirecionamentos ---
    if (isAuth && isLoginPage) {
      // Usuário autenticado tentando acessar login, redireciona para dashboard
      const response = NextResponse.redirect(new URL("/dashboard", req.url));
      applyCSP(response);
      applySecurityHeaders(response);
      return response;
    }

    if (isProtectedRoute && !isAuth) {
      // Usuário não autenticado tentando acessar rota protegida
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Acesso negado: usuário não autenticado tentando acessar",
          req.nextUrl.pathname
        );
      }
      const response = NextResponse.redirect(new URL("/login", req.url));
      applyCSP(response);
      applySecurityHeaders(response);
      return response;
    }

    // Fluxo padrão: segue para a próxima rota
    const response = NextResponse.next();
    applyCSP(response);
    applySecurityHeaders(response);
    return response;
  } catch (error) {
    // --- Tratamento de erro ---
    if (process.env.NODE_ENV === "development") {
      console.error("Erro no middleware de autenticação:", error);
    }
    const response = NextResponse.redirect(new URL("/login", req.url));
    applyCSP(response);
    applySecurityHeaders(response);
    return response;
  }
}

// --- Matcher de rotas protegidas ---
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|publico).*)", // Exclui rotas públicas como '/publico'
  ],
};
