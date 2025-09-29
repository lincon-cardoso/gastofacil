import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

// Middleware de autenticação e proteção de rotas

// Em Edge Runtime, evite Node 'crypto'. Para CSRF, validamos Origin/Referer.
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL; // opcional, para multi-host

// Geração de nonce compatível com Edge Runtime (prioriza getRandomValues)
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
  // Ajuste as permissões às necessidades do app
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
  // Cabeçalho X-XSS-Protection removido, pois é obsoleto em navegadores modernos
}

// --- Rate limiting compatível com Edge ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10; // Máximo de 10 requisições por janela
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h para controle de sessão única

// Usa APP_ENV para lógica customizada, mantém NODE_ENV para Next.js
const isProd = process.env.APP_ENV === "production";
const isDev = process.env.APP_ENV === "development";
let warnedUpstash = false; // evita spam de logs em produção

// Flag para desabilitar sessão única temporariamente (útil para debug)
const DISABLE_SINGLE_SESSION = process.env.DISABLE_SINGLE_SESSION === "true";

// Fallback em memória (não escalável, útil para dev/local)
const rateLimitMap: Map<string, number[]> = new Map();

type RateLimitResult = {
  limited: boolean;
  limit: number;
  remaining: number;
  resetMs: number; // tempo até reset em milissegundos
};

async function rateLimit(req: NextRequest): Promise<RateLimitResult> {
  // Obtém IP do cliente
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Tenta usar Upstash (Edge-safe). Caso falhe ou não configurado, usa fallback local.
  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:${ip}`;
      const ttlSeconds = Math.ceil(RATE_LIMIT_WINDOW / 1000);
      // Pipeline: INCR + EXPIRE NX + PTTL (obter tempo restante da janela)
      const res = await fetch(`${upstashUrl.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, `${ttlSeconds}`, "NX"],
          ["PTTL", key],
        ]),
      });

      if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
      const data = (await res.json()) as Array<{ result: number }>;
      const current = Number(data?.[0]?.result ?? 0);
      const pttl = Number(data?.[2]?.result ?? RATE_LIMIT_WINDOW);
      const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - current);
      return {
        limited: current > RATE_LIMIT_MAX_REQUESTS,
        limit: RATE_LIMIT_MAX_REQUESTS,
        remaining,
        resetMs: pttl > 0 ? pttl : RATE_LIMIT_WINDOW,
      };
    } catch {
      // Silencia e usa fallback local
    }
  }

  // Fallback local em memória (sliding window simples)
  const now = Date.now();
  if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);
  const timestamps = rateLimitMap.get(ip)!;
  while (timestamps.length && timestamps[0] <= now - RATE_LIMIT_WINDOW) {
    timestamps.shift();
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - timestamps.length);
  if (isProd && !warnedUpstash && (!upstashUrl || !upstashToken)) {
    warnedUpstash = true;
    console.warn(
      "[middleware] Upstash Redis não configurado em produção. Usando fallback em memória para rate limiting (não escalável)."
    );
  }
  return {
    limited: timestamps.length > RATE_LIMIT_MAX_REQUESTS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining,
    resetMs: RATE_LIMIT_WINDOW - (now - timestamps[0]!),
  };
}

// Removido: manipulação manual de cookies/tokens do NextAuth. Confiamos no SDK para gerenciar cookies.

// Função para forçar sessão única por usuário usando Upstash.
// Retorna true se detectar sessão duplicada.
async function enforceSingleSession(token: JWT): Promise<boolean> {
  // Permite desabilitar sessão única temporariamente
  if (DISABLE_SINGLE_SESSION) {
    if (isDev) {
      console.log(
        "[middleware] Sessão única desabilitada via DISABLE_SINGLE_SESSION"
      );
    }
    return false;
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!token?.sub || !token?.jti) {
    if (isDev) {
      console.warn("[middleware] Token inválido para sessão única:", {
        sub: !!token?.sub,
        jti: !!token?.jti,
      });
    }
    return false;
  }

  if (!upstashUrl || !upstashToken) {
    if (isProd && !warnedUpstash) {
      warnedUpstash = true;
      console.warn(
        "[middleware] Upstash Redis não configurado em produção. Sessão única não será aplicada."
      );
    }
    return false; // sem Upstash, não conseguimos aplicar sessão única de forma confiável
  }

  const sessionKey = `session:${token.sub}`;
  try {
    if (isDev) {
      console.log(
        "[middleware] Verificando sessão única para usuário:",
        token.sub,
        "jti:",
        token.jti
      );
    }

    // Tenta reivindicar a sessão com SET NX. Se já existir, faz GET e compara.
    const res = await fetch(`${upstashUrl.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        [
          "SET",
          sessionKey,
          token.jti as string,
          "NX",
          "EX",
          `${SESSION_TTL_SECONDS}`,
        ],
        ["GET", sessionKey],
        // Renova TTL se a sessão existente pertencer ao mesmo jti (usuário ativo)
        [
          "EVAL",
          "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('EXPIRE', KEYS[1], ARGV[2]) else return 0 end",
          "1",
          sessionKey,
          token.jti as string,
          `${SESSION_TTL_SECONDS}`,
        ],
      ]),
    });
    if (!res.ok) {
      if (isDev) {
        console.error(
          "[middleware] Upstash HTTP error:",
          res.status,
          res.statusText
        );
      }
      throw new Error(`Upstash HTTP ${res.status}`);
    }

    const data = (await res.json()) as Array<{
      result: string | number | null;
    }>;

    const setResult = data?.[0]?.result; // "OK" se conseguiu setar, null se já existia
    const current = data?.[1]?.result as string | null;

    if (isDev) {
      console.log("[middleware] Resultado sessão única:", {
        setResult,
        current,
        jti: token.jti,
      });
    }

    if (setResult === "OK") {
      if (isDev) {
        console.log(
          "[middleware] Nova sessão registrada para usuário:",
          token.sub
        );
      }
      return false; // sessão registrada agora
    }

    // Já existia: se o valor atual for diferente do jti, é sessão duplicada
    const isDuplicate = !!current && current !== token.jti;
    if (isDuplicate && isDev) {
      console.warn("[middleware] Sessão duplicada detectada:", {
        userId: token.sub,
        currentJti: current,
        newJti: token.jti,
      });
    }

    return isDuplicate;
  } catch (e) {
    console.error("[middleware] Erro ao verificar sessão única:", e);
    // Em caso de falha na verificação, não bloqueia o usuário para evitar falso positivo
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isRegisterPage = req.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // Aplica rate limiting em rotas sensíveis
  if (isLoginPage || isRegisterPage) {
    const rl = await rateLimit(req);
    if (rl.limited) {
      const headers = new Headers();
      headers.set("Retry-After", String(Math.ceil(rl.resetMs / 1000)));
      headers.set("X-RateLimit-Limit", String(rl.limit));
      headers.set("X-RateLimit-Remaining", String(Math.max(0, rl.remaining)));
      headers.set(
        "X-RateLimit-Reset",
        String(Math.floor((Date.now() + rl.resetMs) / 1000))
      );
      return new NextResponse(
        "Muitas requisições. Tente novamente mais tarde.",
        { status: 429, headers }
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
    // --- Proteção contra CSRF (Origin/Referer) ---
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

    // --- Autenticação ---
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

    // --- Redirecionamentos ---
    if (isAuth && isLoginPage) {
      // Usuário autenticado tentando acessar login, redireciona para dashboard
      const response = NextResponse.redirect(new URL("/dashboard", req.url));
      applyCSP(response, nonce);
      return response;
    }

    // Aplica sessão única quando autenticado
    if (isAuth && token) {
      const duplicate = await enforceSingleSession(token as JWT);
      if (duplicate) {
        // Em navegações GET, não bloqueia: redireciona para o dashboard (se não estiver nele)
        // Isso evita falso positivo quando o usuário já está logado e clica em "Entrar"
        if (req.method === "GET") {
          if (req.nextUrl.pathname !== "/dashboard") {
            const res = NextResponse.redirect(new URL("/dashboard", req.url));
            applyCSP(res, nonce);
            return res;
          }
          // Já estamos no dashboard: segue o fluxo normal
          return NextResponse.next();
        }
        // Para métodos state-changing, mantém a proteção forte
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

    // Fluxo padrão: segue para a próxima rota
    const response = NextResponse.next();

    // Adicionar cabeçalhos de segurança apenas em rotas protegidas ou sensíveis
    if (isProtectedRoute || isLoginPage || isRegisterPage) {
      applyCSP(response, nonce);
      applySecurityHeaders(response);
    }

    return response;
  } catch (error) {
    // --- Tratamento de erro ---
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

// --- Matcher de rotas protegidas ---
export const config = {
  matcher: [
    // Exclui públicos e rotas sensíveis do NextAuth
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|assets/|images/|favicons/|publico|api/auth).*)",
  ],
};
