import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Middleware de autenticação e proteção de rotas

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL;

// Configuração do Redis e Rate Limiting usando SDK oficial
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute
  analytics: true,
});

// Geração de nonce compatível com Edge Runtime
async function generateNonce() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return (crypto as unknown as { randomUUID: () => string }).randomUUID();
    } catch {
      // ignora e cai no fallback
    }
  }
  // Fallback (menos seguro, apenas para ambientes legados)
  const array = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
  );
  return btoa(String.fromCharCode(...array));
}

// Função para configurar CSP com suporte a nonce
function applyCSP(response: NextResponse, nonce: string) {
  const CSP_STRICT = process.env.SECURITY_CSP_STRICT === "true";
  const CSP_DEV = [
    "default-src 'self'",
    "base-uri 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https: data:",
    "connect-src 'self' https: ws: wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  // Em produção, oferecemos dois modos: compatível (unsafe-inline) e estrito (nonce + strict-dynamic)
  const scriptSrcProd = CSP_STRICT
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://static.cloudflareinsights.com`
    : `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com 'nonce-${nonce}'`;

  const CSP_PROD = [
    "default-src 'self'",
    "base-uri 'self'",
    scriptSrcProd,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https: data:",
    // Mantemos ws/wss por compatibilidade com cenários que usem websockets
    "connect-src 'self' https: ws: wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const csp = process.env.APP_ENV === "development" ? CSP_DEV : CSP_PROD;
  response.headers.set("Content-Security-Policy", csp);
}

// Função para configurar cabeçalhos de segurança manualmente
function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    [
      "geolocation=()",
      "camera=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "clipboard-read=()",
      "clipboard-write=()",
    ].join(", ")
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
}

// Configurações
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h para controle de sessão única
const isDev = process.env.APP_ENV === "development";

// Rate limiting usando SDK oficial do Upstash
async function checkRateLimit(req: NextRequest): Promise<boolean> {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await ratelimit.limit(ip);
    return !success; // retorna true se foi limitado
  } catch (error) {
    if (isDev) {
      console.warn(
        "[middleware] Rate limiting falhou, permitindo requisição:",
        error
      );
    }
    return false; // Em caso de erro, não bloqueia a requisição
  }
}

// Função para forçar sessão única por usuário usando Upstash Redis
async function enforceSingleSession(token: JWT): Promise<boolean> {
  if (!token?.sub || !token?.jti) {
    if (isDev) {
      console.warn("[middleware] Token inválido para sessão única:", {
        sub: !!token?.sub,
        jti: !!token?.jti,
      });
    }
    return false;
  }

  try {
    const sessionKey = `session:${token.sub}`;

    if (isDev) {
      console.log(
        "[middleware] Verificando sessão única para usuário:",
        token.sub,
        "jti:",
        token.jti
      );
    }

    // Tenta definir a sessão se não existir (NX = Only set if Not eXists)
    const setResult = await redis.set(sessionKey, token.jti, {
      nx: true,
      ex: SESSION_TTL_SECONDS,
    });

    if (setResult === "OK") {
      if (isDev) {
        console.log(
          "[middleware] Nova sessão registrada para usuário:",
          token.sub
        );
      }
      return false; // sessão registrada agora
    }

    // Se não conseguiu setar, verifica se a sessão existente é do mesmo jti
    const current = await redis.get(sessionKey);
    const isDuplicate = !!current && current !== token.jti;

    if (isDuplicate && isDev) {
      console.warn("[middleware] Sessão duplicada detectada:", {
        userId: token.sub,
        currentJti: current,
        newJti: token.jti,
      });
    }

    // Se é a mesma sessão, renova o TTL
    if (!isDuplicate && current === token.jti) {
      await redis.expire(sessionKey, SESSION_TTL_SECONDS);
    }

    return isDuplicate;
  } catch (error) {
    console.error("[middleware] Erro ao verificar sessão única:", error);
    return false; // Em caso de falha, não bloqueia o usuário
  }
}

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isRegisterPage = req.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // Aplica rate limiting em rotas sensíveis usando SDK oficial
  if (isLoginPage || isRegisterPage) {
    const isLimited = await checkRateLimit(req);
    if (isLimited) {
      return new NextResponse(
        "Muitas requisições. Tente novamente mais tarde.",
        { status: 429 }
      );
    }
  }

  const nonce = await generateNonce();

  // Só executa autenticação se necessário
  if (!isLoginPage && !isProtectedRoute && !isAdminRoute) {
    const response = NextResponse.next();
    applyCSP(response, nonce);
    return response;
  }

  try {
    // Proteção contra CSRF (Origin/Referer)
    const stateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(
      req.method
    );
    if (stateChanging) {
      const expectedOrigin = APP_ORIGIN ?? req.nextUrl.origin;
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");

      let sameOrigin = false;
      if (origin) {
        sameOrigin = origin === expectedOrigin;
      } else if (referer) {
        try {
          const refererOrigin = new URL(referer).origin;
          sameOrigin = refererOrigin === expectedOrigin;
        } catch {
          sameOrigin = false;
        }
      }

      if (!sameOrigin) {
        return new NextResponse("Falha na validação CSRF (origem inválida)", {
          status: 403,
        });
      }
    }

    // Autenticação
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

    // Redirecionamentos
    if (isAuth && isLoginPage) {
      const response = NextResponse.redirect(new URL("/dashboard", req.url));
      applyCSP(response, nonce);
      return response;
    }

    // Aplica sessão única quando autenticado
    if (isAuth && token) {
      const duplicate = await enforceSingleSession(token as JWT);
      if (duplicate) {
        if (req.method === "GET") {
          if (req.nextUrl.pathname !== "/dashboard") {
            const res = NextResponse.redirect(new URL("/dashboard", req.url));
            applyCSP(res, nonce);
            return res;
          }
          return NextResponse.next();
        }
        const res = new NextResponse("Sessão inválida. Faça login novamente.", {
          status: 403,
        });
        applyCSP(res, nonce);
        return res;
      }
    }

    if ((isProtectedRoute || isAdminRoute) && !isAuth) {
      // Usuário não autenticado tentando acessar rota protegida
      if (isDev) {
        console.warn(
          "Acesso negado: usuário não autenticado tentando acessar",
          req.nextUrl.pathname
        );
      }
      const response = NextResponse.redirect(new URL("/login", req.url));
      applyCSP(response, nonce);
      return response;
    }

    // Restrição de acesso para rotas administrativas
    if (isAdminRoute && isAuth) {
      const role = (token as JWT | null)?.role;
      if (role !== "ADMIN") {
        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        applyCSP(response, nonce);
        return response;
      }
    }

    // Fluxo padrão
    const response = NextResponse.next();

    if (isProtectedRoute || isLoginPage || isRegisterPage) {
      applyCSP(response, nonce);
      applySecurityHeaders(response);
    }

    return response;
  } catch (error) {
    const traceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
        : Math.random().toString(36).slice(2);
    console.error("[middleware] Erro:", {
      traceId,
      path: req.nextUrl.pathname,
      method: req.method,
      error,
    });
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.headers.set("X-Trace-Id", traceId);
    applyCSP(response, nonce);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|assets/|images/|favicons/|publico|api/auth).*)",
  ],
};
