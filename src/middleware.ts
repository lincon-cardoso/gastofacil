import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL;

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
});

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
    } catch {}
  }
  const array = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
  );
  return btoa(String.fromCharCode(...array));
}

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
    "connect-src 'self' https: ws: wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const csp = process.env.APP_ENV === "development" ? CSP_DEV : CSP_PROD;
  response.headers.set("Content-Security-Policy", csp);
}

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

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h
const isDev = process.env.APP_ENV === "development";

// === CONFIGURAÇÃO DINÂMICA ===
interface MiddlewareConfig {
  sessionMode: "single" | "multi";
  anomalyDetection: boolean;
  metricsEnabled: boolean;
  maintenanceMode: boolean;
}

async function getConfig(): Promise<MiddlewareConfig> {
  try {
    const config = await redis.get("middleware:config");
    if (config) {
      // Verifica se é string e tenta fazer parse
      if (typeof config === "string") {
        return JSON.parse(config);
      }
      // Se já é um objeto, usa diretamente
      if (typeof config === "object" && config !== null) {
        return config as MiddlewareConfig;
      }
    }
  } catch (error) {
    if (isDev) console.warn("Falha ao carregar config, usando padrão:", error);

    // Se houve erro, tenta recriar a configuração padrão
    try {
      const defaultConfig = {
        sessionMode: "single",
        anomalyDetection: true,
        metricsEnabled: true,
        maintenanceMode: false,
      };
      await redis.set("middleware:config", JSON.stringify(defaultConfig));
      if (isDev) console.log("Configuração padrão recriada no Redis");
    } catch (recreateError) {
      if (isDev) console.warn("Erro ao recriar configuração:", recreateError);
    }
  }

  return {
    sessionMode: "single",
    anomalyDetection: true,
    metricsEnabled: true,
    maintenanceMode: false,
  };
}

// === UTILITÁRIOS ===
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function generateDeviceFingerprint(req: NextRequest): string {
  const userAgent = req.headers.get("user-agent") || "";
  const acceptLang = req.headers.get("accept-language") || "";
  const acceptEnc = req.headers.get("accept-encoding") || "";

  const fingerprint = `${userAgent}|${acceptLang}|${acceptEnc}`;

  // Simples hash para reduzir tamanho
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// === DETECÇÃO DE ANOMALIAS ===
interface SecurityAnomaly {
  suspicious: boolean;
  reason?: string;
  severity?: "low" | "medium" | "high";
}

async function detectSecurityAnomalies(
  req: NextRequest,
  token: JWT
): Promise<SecurityAnomaly> {
  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || "";
  const userId = token.sub;

  if (!userId) return { suspicious: false };

  try {
    // Detecta múltiplos IPs em curto período (30min)
    const ipKey = `security:ips:${userId}`;
    await redis.sadd(ipKey, ip);
    await redis.expire(ipKey, 1800); // 30min

    const uniqueIPs = await redis.scard(ipKey);
    if (uniqueIPs > 3) {
      await redis.incr(`anomaly:${userId}:multi_ip`);
      await redis.expire(`anomaly:${userId}:multi_ip`, 3600);
      return {
        suspicious: true,
        reason: "multiple_ips",
        severity: "medium",
      };
    }

    // Detecta mudanças significativas de User-Agent
    const uaKey = `security:ua:${userId}`;
    const lastUA = await redis.get(uaKey);

    if (lastUA && lastUA !== userAgent) {
      const similarity = calculateUASimilarity(lastUA as string, userAgent);
      if (similarity < 0.6) {
        // Menos de 60% de similaridade
        await redis.incr(`anomaly:${userId}:ua_change`);
        await redis.expire(`anomaly:${userId}:ua_change`, 7200);
        return {
          suspicious: true,
          reason: "user_agent_change",
          severity: "low",
        };
      }
    }

    await redis.set(uaKey, userAgent, { ex: 86400 }); // 24h
  } catch (error) {
    if (isDev) console.error("Erro na detecção de anomalias:", error);
  }

  return { suspicious: false };
}

function calculateUASimilarity(ua1: string, ua2: string): number {
  // Extrai partes principais do User-Agent (browser, version, OS)
  const extract = (ua: string) => {
    const parts = ua.match(
      /(Chrome|Firefox|Safari|Edge)\/[\d.]+|Windows|Mac|Linux|Android|iOS/g
    );
    return parts ? parts.join("|") : ua.slice(0, 50);
  };

  const parts1 = extract(ua1);
  const parts2 = extract(ua2);

  if (parts1 === parts2) return 1.0;

  // Similaridade básica por caracteres comuns
  const commonChars = [...parts1].filter((char) =>
    parts2.includes(char)
  ).length;
  const maxLength = Math.max(parts1.length, parts2.length);

  return maxLength > 0 ? commonChars / maxLength : 0;
}

// === SISTEMA MULTI-DEVICE ===
interface DeviceSession {
  jti: string;
  deviceId: string;
  userAgent: string;
  ip: string;
  lastActivity: number;
}

async function enforceMultiDeviceLimit(
  token: JWT,
  req: NextRequest
): Promise<{ shouldBlock: boolean }> {
  const deviceFingerprint = generateDeviceFingerprint(req);
  const sessionsKey = `user_sessions:${token.sub}`;
  const MAX_DEVICES = 3;

  try {
    // Recupera sessões existentes
    const sessions = await redis.lrange(sessionsKey, 0, -1);
    const activeSessions: DeviceSession[] = sessions
      .map((s) => {
        try {
          return JSON.parse(s as string);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Verifica se é o mesmo dispositivo
    const existingSession = activeSessions.find(
      (s) => s.deviceId === deviceFingerprint || s.jti === token.jti
    );

    if (existingSession) {
      // Atualiza última atividade
      existingSession.lastActivity = Date.now();
      await redis.lset(
        sessionsKey,
        activeSessions.indexOf(existingSession),
        JSON.stringify(existingSession)
      );
      return { shouldBlock: false };
    }

    // Novo dispositivo
    if (activeSessions.length >= MAX_DEVICES) {
      // Remove dispositivo mais antigo
      await redis.lpop(sessionsKey);
    }

    // Adiciona nova sessão
    const newSession: DeviceSession = {
      jti: token.jti || "",
      deviceId: deviceFingerprint,
      userAgent: req.headers.get("user-agent") || "",
      ip: getClientIP(req),
      lastActivity: Date.now(),
    };

    await redis.rpush(sessionsKey, JSON.stringify(newSession));
    await redis.expire(sessionsKey, SESSION_TTL_SECONDS);

    return { shouldBlock: false };
  } catch (error) {
    if (isDev) console.error("Erro no controle multi-device:", error);
    return { shouldBlock: false }; // Em caso de erro, não bloqueia
  }
}

// === SISTEMA DE MÉTRICAS ===
interface RequestMetrics {
  path: string;
  method: string;
  duration: number;
  status: number;
  userAgent: string;
  ip: string;
}

async function collectDetailedMetrics(
  req: NextRequest,
  status: number,
  startTime: number
): Promise<void> {
  try {
    const metrics: RequestMetrics = {
      path: req.nextUrl.pathname,
      method: req.method,
      duration: Date.now() - startTime,
      status,
      userAgent: req.headers.get("user-agent")?.slice(0, 100) || "",
      ip: getClientIP(req),
    };

    const hour = new Date().toISOString().slice(0, 13);
    const metricsKey = `metrics:${hour}`;

    // Contadores por hora (não aguarda para não afetar performance)
    const promises = [
      redis.hincrby(metricsKey, "total_requests", 1),
      redis.hincrby(metricsKey, `status_${status}`, 1),
      redis.hincrby(metricsKey, "total_duration", metrics.duration),
      redis.expire(metricsKey, 172800), // 48h
    ];

    // Log detalhado para requests problemáticos
    if (status >= 400 || metrics.duration > 5000) {
      redis
        .lpush("error_requests", JSON.stringify(metrics))
        .then(() => redis.ltrim("error_requests", 0, 999))
        .catch((error) => {
          if (isDev) console.error("Erro ao salvar error_requests:", error);
        });
    }

    // Executa em background
    Promise.all(promises).catch((error) => {
      if (isDev) console.error("Erro ao coletar métricas:", error);
    });
  } catch (error) {
    if (isDev) console.error("Erro na coleta de métricas:", error);
  }
}

// === CACHE HEADERS INTELIGENTES ===
function applyIntelligentCaching(
  response: NextResponse,
  req: NextRequest
): void {
  const path = req.nextUrl.pathname;

  // Assets estáticos
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    return;
  }

  // API routes
  if (path.startsWith("/api/")) {
    if (path.includes("/user/") || path.includes("/auth/")) {
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
      );
    } else {
      response.headers.set(
        "Cache-Control",
        "private, max-age=300, stale-while-revalidate=60"
      );
    }
    return;
  }

  // Páginas protegidas
  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    response.headers.set("Cache-Control", "private, no-cache, must-revalidate");
  } else if (
    path === "/" ||
    path.startsWith("/sobre") ||
    path.startsWith("/contato")
  ) {
    // Páginas públicas
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  } else {
    // Páginas dinâmicas gerais
    response.headers.set(
      "Cache-Control",
      "private, max-age=300, stale-while-revalidate=60"
    );
  }
}

// === LÓGICA “ÚLTIMO LOGIN VENCE” ===
// Armazena no Redis: {"jti": string, "iat": number}
// Se token.iat > stored.iat -> atualiza para o novo (derruba o antigo).
// Se token.iat < stored.iat -> sessão antiga -> bloqueia.
async function enforceSingleSessionLatestWins(token: JWT): Promise<{
  shouldBlock: boolean;
}> {
  if (!token?.sub || !token?.jti) {
    if (isDev) {
      console.warn("[middleware] Token inválido para sessão única:", {
        sub: !!token?.sub,
        jti: !!token?.jti,
      });
    }
    return { shouldBlock: false };
  }

  try {
    const sessionKey = `session:${token.sub}`;
    const nowIat =
      typeof token.iat === "number" ? token.iat : Math.floor(Date.now() / 1000);

    const storedRaw = await redis.get<string>(sessionKey);
    let stored: { jti: string; iat: number } | null = null;

    if (storedRaw) {
      try {
        stored = JSON.parse(storedRaw) as { jti: string; iat: number };
      } catch {
        // Valor legado (apenas jti). Trate como iat antigo = 0.
        stored = { jti: storedRaw as unknown as string, iat: 0 };
      }
    }

    if (!stored) {
      // Primeira sessão registrada
      await redis.set(
        sessionKey,
        JSON.stringify({ jti: token.jti, iat: nowIat }),
        {
          ex: SESSION_TTL_SECONDS,
        }
      );
      if (isDev)
        console.log(
          `[middleware] Nova sessão registrada (latest wins): ${token.sub}`
        );
      return { shouldBlock: false };
    }

    if (stored.jti === token.jti) {
      // Mesma sessão vigente: renova TTL
      await redis.expire(sessionKey, SESSION_TTL_SECONDS);
      return { shouldBlock: false };
    }

    // Sessões diferentes
    if (nowIat > (stored.iat ?? 0)) {
      // ESTE request é o login mais novo -> assume controle
      await redis.set(
        sessionKey,
        JSON.stringify({ jti: token.jti, iat: nowIat }),
        {
          ex: SESSION_TTL_SECONDS,
        }
      );
      if (isDev) {
        console.warn("[middleware] Rotação de sessão (latest wins):", {
          user: token.sub,
          old: stored,
          new: { jti: token.jti, iat: nowIat },
        });
      }
      return { shouldBlock: false }; // deixa passar (novo login válido)
    }

    // ESTE request é mais velho que o armazenado -> bloquear (derrubado)
    if (isDev) {
      console.warn("[middleware] Sessão antiga bloqueada (latest wins):", {
        user: token.sub,
        stored,
        current: { jti: token.jti, iat: nowIat },
      });
    }
    return { shouldBlock: true };
  } catch (error) {
    console.error(
      "[middleware] Erro ao verificar sessão única (latest wins):",
      error
    );
    return { shouldBlock: false }; // em falha, não bloqueia
  }
}

async function checkRateLimit(req: NextRequest): Promise<boolean> {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const { success } = await ratelimit.limit(ip);
    return !success;
  } catch (error) {
    if (isDev)
      console.warn(
        "[middleware] Rate limiting falhou, permitindo requisição:",
        error
      );
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const startTime = Date.now();
  const config = await getConfig();

  // Modo manutenção
  if (config.maintenanceMode && !req.nextUrl.pathname.startsWith("/admin")) {
    const response = new NextResponse(
      "Sistema em manutenção. Tente novamente em alguns minutos.",
      {
        status: 503,
        headers: {
          "Retry-After": "300", // 5 minutos
          "Content-Type": "text/plain; charset=utf-8",
        },
      }
    );
    if (config.metricsEnabled) {
      collectDetailedMetrics(req, 503, startTime);
    }
    return response;
  }

  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isRegisterPage = req.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (isLoginPage || isRegisterPage) {
    const isLimited = await checkRateLimit(req);
    if (isLimited) {
      const response = new NextResponse(
        "Muitas requisições. Tente novamente mais tarde.",
        { status: 429 }
      );
      if (config.metricsEnabled) {
        collectDetailedMetrics(req, 429, startTime);
      }
      return response;
    }
  }

  const nonce = await generateNonce();

  // Rotas públicas: só aplica CSP e cache
  if (!isLoginPage && !isProtectedRoute && !isAdminRoute) {
    const response = NextResponse.next();
    applyCSP(response, nonce);
    applyIntelligentCaching(response, req);
    if (config.metricsEnabled) {
      collectDetailedMetrics(req, 200, startTime);
    }
    return response;
  }

  try {
    // CSRF básico
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
          sameOrigin = new URL(referer).origin === expectedOrigin;
        } catch {
          sameOrigin = false;
        }
      }

      if (!sameOrigin) {
        const response = new NextResponse(
          "Falha na validação CSRF (origem inválida)",
          {
            status: 403,
          }
        );
        if (config.metricsEnabled) {
          collectDetailedMetrics(req, 403, startTime);
        }
        return response;
      }
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

    // Detecção de anomalias de segurança
    if (config.anomalyDetection && isAuth && token) {
      const anomaly = await detectSecurityAnomalies(req, token as JWT);
      if (anomaly.suspicious) {
        if (isDev) {
          console.warn(`[SECURITY] Anomalia detectada: ${anomaly.reason}`, {
            user: token.sub,
            ip: getClientIP(req),
            severity: anomaly.severity,
          });
        }
        // Para anomalias de alta severidade, podemos bloquear
        if (anomaly.severity === "high") {
          const response = new NextResponse("Atividade suspeita detectada", {
            status: 403,
          });
          if (config.metricsEnabled) {
            collectDetailedMetrics(req, 403, startTime);
          }
          return response;
        }
      }
    }

    // /login: se já autenticado, consolida sessão e redireciona
    if (isLoginPage) {
      if (isAuth && token) {
        if (config.sessionMode === "multi") {
          await enforceMultiDeviceLimit(token as JWT, req);
        } else {
          await enforceSingleSessionLatestWins(token as JWT);
        }
        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        applyCSP(response, nonce);
        applyIntelligentCaching(response, req);
        if (config.metricsEnabled) {
          collectDetailedMetrics(req, 302, startTime);
        }
        return response;
      }
      const response = NextResponse.next();
      applyCSP(response, nonce);
      applyIntelligentCaching(response, req);
      if (config.metricsEnabled) {
        collectDetailedMetrics(req, 200, startTime);
      }
      return response;
    }

    // Controle de sessão nas rotas protegidas
    if (isAuth && token) {
      if (config.sessionMode === "multi") {
        const { shouldBlock } = await enforceMultiDeviceLimit(
          token as JWT,
          req
        );
        if (shouldBlock) {
          const response = NextResponse.redirect(new URL("/login", req.url));
          // limpa cookies da sessão
          response.cookies.set("next-auth.session-token", "", {
            expires: new Date(0),
            path: "/",
          });
          response.cookies.set("__Secure-next-auth.session-token", "", {
            expires: new Date(0),
            path: "/",
          });
          applyCSP(response, nonce);
          if (config.metricsEnabled) {
            collectDetailedMetrics(req, 302, startTime);
          }
          return response;
        }
      } else {
        const { shouldBlock } = await enforceSingleSessionLatestWins(
          token as JWT
        );
        if (shouldBlock) {
          const response = NextResponse.redirect(new URL("/login", req.url));
          // limpa cookies da sessão antiga
          response.cookies.set("next-auth.session-token", "", {
            expires: new Date(0),
            path: "/",
          });
          response.cookies.set("__Secure-next-auth.session-token", "", {
            expires: new Date(0),
            path: "/",
          });
          applyCSP(response, nonce);
          if (config.metricsEnabled) {
            collectDetailedMetrics(req, 302, startTime);
          }
          return response;
        }
      }
    }

    // Acesso sem auth em rota protegida
    if ((isProtectedRoute || isAdminRoute) && !isAuth) {
      if (isDev) {
        console.warn(
          "Acesso negado: usuário não autenticado tentando acessar",
          req.nextUrl.pathname
        );
      }
      const response = NextResponse.redirect(new URL("/login", req.url));
      applyCSP(response, nonce);
      if (config.metricsEnabled) {
        collectDetailedMetrics(req, 302, startTime);
      }
      return response;
    }

    // Autorização admin
    if (isAdminRoute && isAuth) {
      const role = (token as JWT | null)?.role;
      if (role !== "ADMIN") {
        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        applyCSP(response, nonce);
        if (config.metricsEnabled) {
          collectDetailedMetrics(req, 302, startTime);
        }
        return response;
      }
    }

    const response = NextResponse.next();
    if (isProtectedRoute || isLoginPage || isRegisterPage) {
      applyCSP(response, nonce);
      applySecurityHeaders(response);
    }
    applyIntelligentCaching(response, req);
    if (config.metricsEnabled) {
      collectDetailedMetrics(req, 200, startTime);
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

    // Coleta métricas de erro
    try {
      const config = await getConfig();
      if (config.metricsEnabled) {
        collectDetailedMetrics(req, 500, startTime);
      }
    } catch (metricsError) {
      if (isDev)
        console.error("Falha ao coletar métricas de erro:", metricsError);
    }

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|assets/|images/|favicons/|publico|api/auth).*)",
  ],
};
