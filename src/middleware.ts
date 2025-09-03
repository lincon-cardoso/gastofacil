import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Middleware de autenticação e proteção de rotas

const CSP_DEV =
  "default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'none';";

const CSP_PROD =
  "default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'none';";

function setCSP(response: NextResponse) {
  const csp = process.env.NODE_ENV === "development" ? CSP_DEV : CSP_PROD;
  response.headers.set("Content-Security-Policy", csp);
}

export async function middleware(req: NextRequest) {
  // --- Variáveis de contexto ---
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  // Só executa autenticação se necessário
  if (!isLoginPage && !isProtectedRoute) {
    const response = NextResponse.next();
    setCSP(response);
    return response;
  }

  try {
    // --- Autenticação ---
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

    // --- Redirecionamentos ---
    if (isAuth && isLoginPage) {
      // Usuário autenticado tentando acessar login, redireciona para dashboard
      const response = NextResponse.redirect(new URL("/dashboard", req.url));
      setCSP(response);
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
      setCSP(response);
      return response;
    }

    // Fluxo padrão: segue para a próxima rota
    const response = NextResponse.next();
    setCSP(response);
    return response;
  } catch (error) {
    // --- Tratamento de erro ---
    if (process.env.NODE_ENV === "development") {
      console.error("Erro no middleware de autenticação:", error);
    }
    const response = NextResponse.redirect(new URL("/login", req.url));
    setCSP(response);
    return response;
  }
}

// --- Matcher de rotas protegidas ---
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
