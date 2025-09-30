/**
 * Configurações centralizadas do middleware
 * Valores que podem ser ajustados conforme necessário
 */

export const MIDDLEWARE_CONFIG = {
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
export const DEFAULT_DYNAMIC_CONFIG = {
  sessionMode: "single" as const,
  anomalyDetection: true,
  metricsEnabled: true,
  maintenanceMode: false,
};

// === ROTAS E PADRÕES ===
export const ROUTE_PATTERNS = {
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
export function validateConfig(config: typeof MIDDLEWARE_CONFIG) {
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
