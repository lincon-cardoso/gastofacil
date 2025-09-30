import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// === CONFIGURAÇÕES CENTRALIZADAS ===
const MIDDLEWARE_CONFIG = {
  // === CONFIGURAÇÕES DE SESSÃO ===
  SESSION_TTL_SECONDS: 60 * 60 * 24, // 24 horas (86400 segundos)
  MAX_DEVICES: 3, // Máximo de dispositivos simultâneos no modo multi-device

  // === RATE LIMITING ===
  RATE_LIMIT: {
    requests: 10, // Número de requests
    window: "60 s", // Janela de tempo (formato Upstash)
    analytics: true, // Habilitar analytics
  },

  // === DETECÇÃO DE ANOMALIAS ===
  ANOMALY_DETECTION: {
    maxUniqueIPs: 3, // Máximo de IPs únicos em 30 minutos
    ipTrackingWindow: 1800, // 30 minutos em segundos
    userAgentSimilarityThreshold: 0.6, // 60% de similaridade mínima
    userAgentCacheTime: 86400, // 24 horas
  },

  // === MÉTRICAS ===
  METRICS: {
    errorRequestsLimit: 999, // Máximo de requests de erro armazenados
    slowRequestThreshold: 5000, // Requests acima de 5s são considerados lentos
    metricsRetention: 172800, // 48 horas de retenção
  },

  // === CACHE HEADERS ===
  CACHE_HEADERS: {
    staticAssets: "public, max-age=31536000, immutable", // 1 ano para assets
    privatePages: "private, no-cache, must-revalidate",
    publicPages: "public, s-maxage=3600, stale-while-revalidate=86400", // 1h + 24h stale
    apiRoutes: "private, max-age=300, stale-while-revalidate=60", // 5min + 1min stale
    sensitiveApi: "private, no-cache, no-store, must-revalidate",
  },

  // === SECURITY HEADERS ===
  SECURITY: {
    frameOptions: "DENY",
    hstsMaxAge: "max-age=31536000; includeSubDomains", // 1 ano
    contentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    coopPolicy: "same-origin",
    corpPolicy: "same-origin",
  },

  // === CSP (Content Security Policy) ===
  CSP: {
    // Domínios confiáveis que podem ser adicionados conforme necessário
    trustedDomains: {
      scripts: ["https://static.cloudflareinsights.com"],
      styles: [],
      images: ["data:", "https:"],
      fonts: ["https:", "data:"],
      connect: ["https:", "ws:", "wss:"],
    },
  },

  // === MANUTENÇÃO ===
  MAINTENANCE: {
    retryAfter: "300", // 5 minutos
    excludePaths: ["/admin"], // Rotas que não são afetadas pela manutenção
  },
} as const;

// === CONFIGURAÇÕES DINÂMICAS PADRÃO ===
const DEFAULT_DYNAMIC_CONFIG = {
  sessionMode: "single" as const,
  anomalyDetection: true,
  metricsEnabled: true,
  maintenanceMode: false,
};

// === ROTAS E PADRÕES ===
const ROUTE_PATTERNS = {
  // Assets estáticos
  staticAssets: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$/,

  // Rotas protegidas
  protected: ["/dashboard"],
  admin: ["/admin"],
  auth: ["/login", "/register"],

  // Rotas públicas que podem ser cached
  publicCacheable: ["/", "/sobre", "/contato", "/planos"],

  // APIs sensíveis (nunca cached)
  sensitiveApi: ["/api/user/", "/api/auth/"],
};

// === VALIDAÇÃO DE CONFIGURAÇÃO ===
function validateConfig(config: typeof MIDDLEWARE_CONFIG) {
  const errors: string[] = [];

  if (config.SESSION_TTL_SECONDS < 300) {
    errors.push("SESSION_TTL_SECONDS deve ser pelo menos 5 minutos (300s)");
  }

  if (config.MAX_DEVICES < 1 || config.MAX_DEVICES > 10) {
    errors.push("MAX_DEVICES deve estar entre 1 e 10");
  }

  if (config.RATE_LIMIT.requests < 1) {
    errors.push("RATE_LIMIT.requests deve ser pelo menos 1");
  }

  if (config.ANOMALY_DETECTION.maxUniqueIPs < 1) {
    errors.push("ANOMALY_DETECTION.maxUniqueIPs deve ser pelo menos 1");
  }

  if (errors.length > 0) {
    throw new Error(`Configuração inválida:\n${errors.join("\n")}`);
  }

  return true;
}

// Validar configuração na inicialização
try {
  validateConfig(MIDDLEWARE_CONFIG);
} catch (error) {
  console.error("Erro na configuração do middleware:", error);
}

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL;
const isDev = process.env.NODE_ENV === "development";

// Inicialização segura do Redis com fallback
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        MIDDLEWARE_CONFIG.RATE_LIMIT.requests,
        MIDDLEWARE_CONFIG.RATE_LIMIT.window
      ),
      analytics: MIDDLEWARE_CONFIG.RATE_LIMIT.analytics,
    });
    if (isDev) console.log("✅ Redis/Upstash inicializado com sucesso");

    // Teste de conectividade inicial
    if (isDev) {
      redis
        .ping()
        .then(() => console.log("✅ Conectividade Upstash verificada"))
        .catch((error) =>
          console.warn("⚠️ Erro no teste de conectividade Upstash:", error)
        );
    }
  } else {
    console.warn(
      "⚠️ Credenciais do Upstash não encontradas - Redis desabilitado"
    );
  }
} catch (error) {
  console.error("❌ Erro ao inicializar Redis/Upstash:", error);
}

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
  const trustedScripts = MIDDLEWARE_CONFIG.CSP.trustedDomains.scripts.join(" ");
  const trustedImages = MIDDLEWARE_CONFIG.CSP.trustedDomains.images.join(" ");
  const trustedFonts = MIDDLEWARE_CONFIG.CSP.trustedDomains.fonts.join(" ");
  const trustedConnect = MIDDLEWARE_CONFIG.CSP.trustedDomains.connect.join(" ");

  const CSP_DEV = [
    "default-src 'self'",
    "base-uri 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${trustedScripts} 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' ${trustedImages}`,
    `font-src 'self' ${trustedFonts}`,
    `connect-src 'self' ${trustedConnect}`,
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const scriptSrcProd = CSP_STRICT
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${trustedScripts}`
    : `script-src 'self' 'unsafe-inline' ${trustedScripts} 'nonce-${nonce}'`;

  const CSP_PROD = [
    "default-src 'self'",
    "base-uri 'self'",
    scriptSrcProd,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' ${trustedImages}`,
    `font-src 'self' ${trustedFonts}`,
    `connect-src 'self' ${trustedConnect}`,
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const csp = isDev ? CSP_DEV : CSP_PROD;
  response.headers.set("Content-Security-Policy", csp);
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set(
    "X-Frame-Options",
    MIDDLEWARE_CONFIG.SECURITY.frameOptions
  );
  response.headers.set(
    "Strict-Transport-Security",
    MIDDLEWARE_CONFIG.SECURITY.hstsMaxAge
  );
  response.headers.set(
    "X-Content-Type-Options",
    MIDDLEWARE_CONFIG.SECURITY.contentTypeOptions
  );
  response.headers.set(
    "Referrer-Policy",
    MIDDLEWARE_CONFIG.SECURITY.referrerPolicy
  );
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
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    MIDDLEWARE_CONFIG.SECURITY.coopPolicy
  );
  response.headers.set(
    "Cross-Origin-Resource-Policy",
    MIDDLEWARE_CONFIG.SECURITY.corpPolicy
  );
}

// === CONFIGURAÇÃO DINÂMICA ===
interface MiddlewareConfig {
  sessionMode: "single" | "multi";
  anomalyDetection: boolean;
  metricsEnabled: boolean;
  maintenanceMode: boolean;
}

async function getConfig(): Promise<MiddlewareConfig> {
  // Se o Redis não está disponível, retorna configuração padrão
  if (!redis) {
    if (isDev)
      console.warn("⚠️ Redis indisponível - usando configuração padrão");
    return DEFAULT_DYNAMIC_CONFIG;
  }

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
    if (isDev)
      console.warn(
        "⚠️ Falha ao carregar config do Redis, usando padrão:",
        error
      );

    // Se houve erro, tenta recriar a configuração padrão
    try {
      await redis.set(
        "middleware:config",
        JSON.stringify(DEFAULT_DYNAMIC_CONFIG)
      );
      if (isDev) console.log("✅ Configuração padrão recriada no Redis");
    } catch (recreateError) {
      if (isDev)
        console.warn(
          "❌ Erro ao recriar configuração no Redis:",
          recreateError
        );
    }
  }

  return DEFAULT_DYNAMIC_CONFIG;
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
  // Se Redis não disponível, desabilita detecção de anomalias
  if (!redis) {
    return { suspicious: false };
  }

  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || "";
  const userId = token.sub;

  if (!userId) return { suspicious: false };

  try {
    // Detecta múltiplos IPs em curto período
    const ipKey = `security:ips:${userId}`;
    await redis.sadd(ipKey, ip);
    await redis.expire(
      ipKey,
      MIDDLEWARE_CONFIG.ANOMALY_DETECTION.ipTrackingWindow
    );

    const uniqueIPs = await redis.scard(ipKey);
    if (uniqueIPs > MIDDLEWARE_CONFIG.ANOMALY_DETECTION.maxUniqueIPs) {
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
      if (
        similarity <
        MIDDLEWARE_CONFIG.ANOMALY_DETECTION.userAgentSimilarityThreshold
      ) {
        await redis.incr(`anomaly:${userId}:ua_change`);
        await redis.expire(`anomaly:${userId}:ua_change`, 7200);
        return {
          suspicious: true,
          reason: "user_agent_change",
          severity: "low",
        };
      }
    }

    await redis.set(uaKey, userAgent, {
      ex: MIDDLEWARE_CONFIG.ANOMALY_DETECTION.userAgentCacheTime,
    });
  } catch (error) {
    if (isDev) console.error("❌ Erro na detecção de anomalias:", error);
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
  // Se Redis não disponível, não bloqueia
  if (!redis) {
    if (isDev)
      console.warn("⚠️ Redis indisponível - multi-device desabilitado");
    return { shouldBlock: false };
  }

  const deviceFingerprint = generateDeviceFingerprint(req);
  const sessionsKey = `user_sessions:${token.sub}`;

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
    if (activeSessions.length >= MIDDLEWARE_CONFIG.MAX_DEVICES) {
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
    await redis.expire(sessionsKey, MIDDLEWARE_CONFIG.SESSION_TTL_SECONDS);

    return { shouldBlock: false };
  } catch (error) {
    if (isDev) console.error("❌ Erro no controle multi-device:", error);
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
  // Se Redis não disponível, skip métricas
  if (!redis) {
    return;
  }

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
      redis.expire(metricsKey, MIDDLEWARE_CONFIG.METRICS.metricsRetention),
    ];

    // Log detalhado para requests problemáticos
    if (
      status >= 400 ||
      metrics.duration > MIDDLEWARE_CONFIG.METRICS.slowRequestThreshold
    ) {
      redis
        .lpush("error_requests", JSON.stringify(metrics))
        .then(() =>
          redis.ltrim(
            "error_requests",
            0,
            MIDDLEWARE_CONFIG.METRICS.errorRequestsLimit
          )
        )
        .catch((error) => {
          if (isDev) console.error("❌ Erro ao salvar error_requests:", error);
        });
    }

    // Executa em background
    Promise.all(promises).catch((error) => {
      if (isDev) console.error("❌ Erro ao coletar métricas:", error);
    });
  } catch (error) {
    if (isDev) console.error("❌ Erro na coleta de métricas:", error);
  }
}

// === CACHE HEADERS INTELIGENTES ===
function applyIntelligentCaching(
  response: NextResponse,
  req: NextRequest
): void {
  const path = req.nextUrl.pathname;

  // Assets estáticos
  if (ROUTE_PATTERNS.staticAssets.test(path)) {
    response.headers.set(
      "Cache-Control",
      MIDDLEWARE_CONFIG.CACHE_HEADERS.staticAssets
    );
    return;
  }

  // API routes
  if (path.startsWith("/api/")) {
    if (ROUTE_PATTERNS.sensitiveApi.some((pattern) => path.includes(pattern))) {
      response.headers.set(
        "Cache-Control",
        MIDDLEWARE_CONFIG.CACHE_HEADERS.sensitiveApi
      );
    } else {
      response.headers.set(
        "Cache-Control",
        MIDDLEWARE_CONFIG.CACHE_HEADERS.apiRoutes
      );
    }
    return;
  }

  // Páginas protegidas
  if (
    ROUTE_PATTERNS.protected.some((pattern) => path.startsWith(pattern)) ||
    ROUTE_PATTERNS.admin.some((pattern) => path.startsWith(pattern))
  ) {
    response.headers.set(
      "Cache-Control",
      MIDDLEWARE_CONFIG.CACHE_HEADERS.privatePages
    );
  } else if (
    ROUTE_PATTERNS.publicCacheable.some(
      (pattern) => path === pattern || path.startsWith(pattern)
    )
  ) {
    // Páginas públicas
    response.headers.set(
      "Cache-Control",
      MIDDLEWARE_CONFIG.CACHE_HEADERS.publicPages
    );
  } else {
    // Páginas dinâmicas gerais
    response.headers.set(
      "Cache-Control",
      MIDDLEWARE_CONFIG.CACHE_HEADERS.apiRoutes
    );
  }
}

// === LÓGICA “ÚLTIMO LOGIN VENCE” ===
// Armazena no Redis: {"jti": string, "iat": number}
// Se token.iat > stored.iat -> atualiza para o novo (derruba o antigo).
// Se token.iat < stored.iat -> sessão antiga -> bloqueia.
async function enforceSingleSession(token: JWT): Promise<{
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

  // Se Redis não disponível, não bloqueia
  if (!redis) {
    if (isDev)
      console.warn(
        "⚠️ Redis indisponível - controle de sessão única desabilitado"
      );
    return { shouldBlock: false };
  }

  try {
    const sessionKey = `session:${token.sub}`;
    const currentJti = token.jti;

    const storedJti = await redis.get<string>(sessionKey);

    if (!storedJti) {
      // Primeira sessão registrada
      await redis.set(sessionKey, currentJti, {
        ex: MIDDLEWARE_CONFIG.SESSION_TTL_SECONDS,
      });
      if (isDev) console.log(`✅ Nova sessão registrada: ${token.sub}`);
      return { shouldBlock: false };
    }

    if (storedJti === currentJti) {
      // Mesma sessão vigente: renova TTL
      await redis.expire(sessionKey, MIDDLEWARE_CONFIG.SESSION_TTL_SECONDS);
      return { shouldBlock: false };
    }

    // Sessão diferente - bloqueia a sessão atual (mantém a primeira ativa)
    if (isDev) {
      console.warn("🚫 Sessão duplicada bloqueada:", {
        user: token.sub,
        stored: storedJti,
        current: currentJti,
      });
    }

    return { shouldBlock: true };
  } catch (error) {
    console.error("❌ Erro ao verificar sessão única:", error);
    return { shouldBlock: false }; // em falha, não bloqueia
  }
}

async function checkRateLimit(req: NextRequest): Promise<boolean> {
  // Se rate limiting não disponível, não bloqueia
  if (!ratelimit) {
    if (isDev)
      console.warn("⚠️ Rate limiting indisponível - sem limitação de requests");
    return false;
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const { success } = await ratelimit.limit(ip);
    return !success;
  } catch (error) {
    if (isDev)
      console.warn("⚠️ Rate limiting falhou, permitindo requisição:", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const startTime = Date.now();
  const config = await getConfig();

  // Modo manutenção
  if (
    config.maintenanceMode &&
    !MIDDLEWARE_CONFIG.MAINTENANCE.excludePaths.some((path) =>
      req.nextUrl.pathname.startsWith(path)
    )
  ) {
    const response = new NextResponse(
      "Sistema em manutenção. Tente novamente em alguns minutos.",
      {
        status: 503,
        headers: {
          "Retry-After": MIDDLEWARE_CONFIG.MAINTENANCE.retryAfter,
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
          await enforceSingleSession(token as JWT);
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

          // Limpa dados do usuário do Upstash em background
          if (token?.sub) {
            clearUserUpstashData(token.sub).catch((cleanupError) => {
              if (isDev) {
                console.warn(
                  `⚠️ Falha na limpeza automática para ${token.sub}:`,
                  cleanupError
                );
              }
            });
          }

          applyCSP(response, nonce);
          if (config.metricsEnabled) {
            collectDetailedMetrics(req, 302, startTime);
          }
          return response;
        }
      } else {
        const { shouldBlock } = await enforceSingleSession(token as JWT);
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

          // Limpa dados do usuário do Upstash em background
          if (token?.sub) {
            clearUserUpstashData(token.sub).catch((cleanupError) => {
              if (isDev) {
                console.warn(
                  `⚠️ Falha na limpeza automática para ${token.sub}:`,
                  cleanupError
                );
              }
            });
          }

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
        console.error("❌ Falha ao coletar métricas de erro:", metricsError);
    }

    return response;
  }
}

// === FUNÇÃO DE LIMPEZA COMPLETA DO UPSTASH ===
export async function clearUserUpstashData(userId: string): Promise<{
  success: boolean;
  clearedKeys: string[];
  error?: string;
}> {
  if (!redis) {
    return {
      success: false,
      clearedKeys: [],
      error: "Redis não inicializado",
    };
  }

  const clearedKeys: string[] = [];

  try {
    // Lista de chaves específicas relacionadas ao usuário
    const specificKeys = [
      `session:${userId}`, // Sessão única
      `user_sessions:${userId}`, // Sessões multi-device
      `security:ips:${userId}`, // IPs de segurança
      `security:ua:${userId}`, // User-agents
      `metrics:user:${userId}`, // Métricas do usuário
      `rate_limit:${userId}`, // Rate limiting específico
    ];

    // Lista de prefixos para buscar chaves com padrões
    const prefixPatterns = [
      `anomaly:${userId}:`, // Detecções de anomalia
      `cache:user:${userId}:`, // Cache específico do usuário
      `ratelimit:${userId}:`, // Rate limiting com dois pontos
      `security:${userId}:`, // Prefixo de segurança genérico
      `metrics:${userId}:`, // Métricas com dois pontos
    ];

    // Remove chaves específicas
    for (const key of specificKeys) {
      try {
        const result = await redis.del(key);
        if (result > 0) {
          clearedKeys.push(key);
        }
      } catch (keyError) {
        if (isDev) {
          console.warn(`⚠️ Erro ao limpar chave ${key}:`, keyError);
        }
      }
    }

    // Para prefixos, usa SCAN para encontrar chaves relacionadas
    for (const prefix of prefixPatterns) {
      try {
        // Usa SCAN para encontrar chaves com o prefixo
        let cursor = "0";
        let iterations = 0;
        const maxIterations = 100; // Evita loops infinitos

        do {
          const scanResult = await redis.scan(cursor, {
            match: `${prefix}*`,
            count: 100,
          });

          iterations++;

          if (Array.isArray(scanResult) && scanResult.length >= 2) {
            cursor = String(scanResult[0]);
            const keys = scanResult[1] as string[];

            if (keys.length > 0) {
              // Remove chaves em lotes menores para melhor compatibilidade
              const deleteResult = await redis.del(...keys);
              if (deleteResult > 0) {
                clearedKeys.push(...keys);
              }
            }
          } else {
            break;
          }
        } while (cursor !== "0" && iterations < maxIterations);

        if (iterations >= maxIterations) {
          console.warn(`⚠️ Atingiu máximo de iterações para prefixo ${prefix}`);
        }
      } catch (scanError) {
        if (isDev) {
          console.warn(`⚠️ Erro ao escanear prefixo ${prefix}:`, scanError);
        }
      }
    }

    // Verificação adicional: tenta buscar qualquer chave que contenha o userId
    try {
      let cursor = "0";
      let iterations = 0;
      const maxIterations = 100;

      do {
        const scanResult = await redis.scan(cursor, {
          match: `*${userId}*`,
          count: 100,
        });

        iterations++;

        if (Array.isArray(scanResult) && scanResult.length >= 2) {
          cursor = String(scanResult[0]);
          const keys = scanResult[1] as string[];

          if (keys.length > 0) {
            // Filtra apenas chaves que realmente pertencem ao usuário
            const userKeys = keys.filter(
              (key) => key.includes(`${userId}`) && !clearedKeys.includes(key) // Evita duplicatas
            );

            if (userKeys.length > 0) {
              const deleteResult = await redis.del(...userKeys);
              if (deleteResult > 0) {
                clearedKeys.push(...userKeys);
              }
            }
          }
        } else {
          break;
        }
      } while (cursor !== "0" && iterations < maxIterations);
    } catch (generalScanError) {
      if (isDev) {
        console.warn(
          `⚠️ Erro na verificação geral de chaves para ${userId}:`,
          generalScanError
        );
      }
    }

    if (isDev) {
      console.log(
        `✅ Dados do usuário ${userId} limpos do Upstash:`,
        clearedKeys
      );
    }

    return { success: true, clearedKeys };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error(`❌ Erro ao limpar dados do usuário ${userId}:`, error);
    return {
      success: false,
      clearedKeys,
      error: errorMessage,
    };
  }
}

// === FUNÇÃO DE HEALTH CHECK DO UPSTASH ===
export async function checkUpstashHealth(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  if (!redis) {
    return { connected: false, error: "Redis não inicializado" };
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    return { connected: true, latency };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|assets/|images/|favicons/|api/auth/providers|api/auth/session|api/auth/csrf).*)",
  ],
};
