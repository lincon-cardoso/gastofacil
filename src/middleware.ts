import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// === CONFIGURAÇÕES CENTRALIZADAS ===
const MIDDLEWARE_CONFIG = {
  // === CONFIGURAÇÕES DE SESSÃO ===
  SESSION_TTL_SECONDS: 60 * 60 * 24, // 24 horas (86400 segundos)

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

// === UTILITÁRIOS ===
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
      return (crypto as { randomUUID: () => string })
        .randomUUID()
        .replace(/-/g, "");
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
  maintenanceMode: boolean;
}

function getConfig(): MiddlewareConfig {
  // Retorna configuração simples baseada em variáveis de ambiente
  return {
    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
  };
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

// === MIDDLEWARE PRINCIPAL ===
export async function middleware(req: NextRequest) {
  const config = getConfig();

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
    return response;
  }

  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isRegisterPage = req.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  const nonce = await generateNonce();

  // Rotas públicas: só aplica CSP e cache
  if (!isLoginPage && !isProtectedRoute && !isAdminRoute) {
    const response = NextResponse.next();
    applyCSP(response, nonce);
    applySecurityHeaders(response);
    applyIntelligentCaching(response, req);
    return response;
  }

  try {
    // CSRF básico para requisições que alteram estado
    const stateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(
      req.method
    );
    if (stateChanging) {
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");

      // Verifica se é uma requisição do mesmo domínio
      if (origin && APP_ORIGIN && !origin.startsWith(APP_ORIGIN)) {
        if (isDev) console.warn("⚠️ CSRF: Origin suspeito:", origin);
        return new NextResponse("Forbidden", { status: 403 });
      }

      if (referer && APP_ORIGIN && !referer.startsWith(APP_ORIGIN)) {
        if (isDev) console.warn("⚠️ CSRF: Referer suspeito:", referer);
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;

    // /login: se já autenticado, redireciona
    if (isLoginPage && isAuth) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      const redirectUrl = callbackUrl || "/dashboard";

      if (isDev) {
        console.log(
          "🔄 Usuário já autenticado, redirecionando para:",
          redirectUrl
        );
      }

      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Acesso sem auth em rota protegida
    if ((isProtectedRoute || isAdminRoute) && !isAuth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

      if (isDev) {
        console.log("🚫 Acesso negado, redirecionando para login");
      }

      return NextResponse.redirect(loginUrl);
    }

    // Autorização admin
    if (isAdminRoute && isAuth) {
      // Verifica se o usuário tem papel de admin
      if (token?.role !== "ADMIN") {
        if (isDev) console.log("🚫 Acesso negado ao admin para:", token?.email);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    const response = NextResponse.next();
    if (isProtectedRoute || isLoginPage || isRegisterPage) {
      applySecurityHeaders(response);
      applyCSP(response, nonce);
    }
    applyIntelligentCaching(response, req);
    return response;
  } catch (error) {
    const traceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as { randomUUID: () => string }).randomUUID()
        : Math.random().toString(36).slice(2);

    console.error("[middleware] Erro:", {
      traceId,
      path: req.nextUrl.pathname,
      method: req.method,
      error,
    });

    const response = NextResponse.redirect(new URL("/login", req.url));
    response.headers.set("X-Trace-ID", traceId);
    applyCSP(response, nonce);
    applySecurityHeaders(response);

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|assets/|images/|favicons/|api/auth/providers|api/auth/session|api/auth/csrf).*)",
  ],
};
