/**
 * Script para testar e validar as configurações do middleware
 * Execute: npx tsx scripts/test-middleware-config.ts
 */

import { loadEnv } from "./load-env";

// Carrega variáveis de ambiente ANTES de importar Redis
loadEnv();

import { Redis } from "@upstash/redis";
import {
  MIDDLEWARE_CONFIG,
  validateConfig,
  DEFAULT_DYNAMIC_CONFIG,
} from "../src/config/middleware.config";

const redis = Redis.fromEnv();

async function testRedisConnection() {
  console.log("🔗 Testando conexão com Redis...");
  try {
    const ping = await redis.ping();
    console.log(`✅ Redis conectado: ${ping}`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com Redis:", error);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log("🌍 Verificando variáveis de ambiente...");

  const requiredVars = [
    "NEXT_PUBLIC_APP_URL",
    "NEXTAUTH_SECRET",
    "APP_ENV",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "SECURITY_CSP_STRICT",
  ];

  const missing: string[] = [];
  const present: string[] = [];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  if (present.length > 0) {
    console.log("✅ Variáveis presentes:", present.join(", "));
  }

  if (missing.length > 0) {
    console.error("❌ Variáveis ausentes:", missing.join(", "));
    return false;
  }

  return true;
}

async function testMiddlewareConfig() {
  console.log("⚙️ Validando configurações do middleware...");

  try {
    validateConfig(MIDDLEWARE_CONFIG);
    console.log("✅ Configurações do middleware são válidas");

    // Mostra algumas configurações importantes
    console.log("📋 Configurações atuais:");
    console.log(
      `• Sessão TTL: ${MIDDLEWARE_CONFIG.SESSION_TTL_SECONDS / 3600}h`
    );
    console.log(`• Max dispositivos: ${MIDDLEWARE_CONFIG.MAX_DEVICES}`);
    console.log(
      `• Rate limit: ${MIDDLEWARE_CONFIG.RATE_LIMIT.requests} req/${MIDDLEWARE_CONFIG.RATE_LIMIT.window}`
    );
    console.log(`• CSP Strict: ${process.env.SECURITY_CSP_STRICT}`);

    return true;
  } catch (error) {
    console.error("❌ Erro na validação:", error);
    return false;
  }
}

async function testDynamicConfig() {
  console.log("🔧 Testando configuração dinâmica no Redis...");

  try {
    const config = await redis.get("middleware:config");

    if (!config) {
      console.log(
        "⚠️ Configuração dinâmica não encontrada, criando configuração padrão..."
      );
      await redis.set(
        "middleware:config",
        JSON.stringify(DEFAULT_DYNAMIC_CONFIG)
      );
      console.log("✅ Configuração padrão criada");
    } else {
      let parsed;
      try {
        // Tenta fazer parse do JSON
        if (typeof config === "string") {
          parsed = JSON.parse(config);
        } else if (typeof config === "object") {
          parsed = config;
        } else {
          throw new Error("Formato de configuração inválido");
        }

        console.log("✅ Configuração dinâmica encontrada:");
        console.log(`• Modo sessão: ${parsed.sessionMode}`);
        console.log(`• Detecção anomalias: ${parsed.anomalyDetection}`);
        console.log(`• Métricas: ${parsed.metricsEnabled}`);
        console.log(`• Manutenção: ${parsed.maintenanceMode}`);
      } catch {
        console.log("⚠️ Configuração corrompida detectada, recriando...");
        await redis.del("middleware:config");
        await redis.set(
          "middleware:config",
          JSON.stringify(DEFAULT_DYNAMIC_CONFIG)
        );
        console.log("✅ Configuração padrão recriada");
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Erro ao testar configuração dinâmica:", error);
    return false;
  }
}

async function testRateLimit() {
  console.log("🚦 Testando configuração de rate limiting...");

  try {
    // Importa o rate limiter para teste
    const { Ratelimit } = await import("@upstash/ratelimit");

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        MIDDLEWARE_CONFIG.RATE_LIMIT.requests,
        MIDDLEWARE_CONFIG.RATE_LIMIT.window
      ),
      analytics: MIDDLEWARE_CONFIG.RATE_LIMIT.analytics,
    });

    // Teste básico
    const result = await ratelimit.limit("test-ip");
    console.log("✅ Rate limiter funcionando:");
    console.log(`• Sucesso: ${result.success}`);
    console.log(`• Remaining: ${result.remaining}`);
    console.log(`• Reset: ${new Date(result.reset).toLocaleTimeString()}`);

    return true;
  } catch (error) {
    console.error("❌ Erro ao testar rate limiting:", error);
    return false;
  }
}

async function generateConfigReport() {
  console.log("\n📊 RELATÓRIO DE CONFIGURAÇÃO DO MIDDLEWARE");
  console.log("=".repeat(50));

  const tests = [
    { name: "Variáveis de ambiente", test: testEnvironmentVariables },
    { name: "Conexão Redis", test: testRedisConnection },
    { name: "Configurações middleware", test: testMiddlewareConfig },
    { name: "Configuração dinâmica", test: testDynamicConfig },
    { name: "Rate limiting", test: testRateLimit },
  ];

  const results: { name: string; success: boolean }[] = [];

  for (const { name, test } of tests) {
    console.log(`\n🧪 ${name}:`);
    const success = await test();
    results.push({ name, success });
  }

  console.log("\n📋 RESUMO:");
  console.log("=".repeat(30));

  let allPassed = true;
  for (const { name, success } of results) {
    const status = success ? "✅ PASSOU" : "❌ FALHOU";
    console.log(`${status} - ${name}`);
    if (!success) allPassed = false;
  }

  if (allPassed) {
    console.log("\n🎉 Todas as configurações estão corretas!");
    console.log("O middleware está pronto para uso.");
  } else {
    console.log("\n⚠️ Algumas configurações precisam de atenção.");
    console.log("Revise os erros acima antes de prosseguir.");
  }

  return allPassed;
}

// Script principal
async function main() {
  const command = process.argv[2];

  switch (command) {
    case "redis":
      await testRedisConnection();
      break;
    case "env":
      await testEnvironmentVariables();
      break;
    case "config":
      await testMiddlewareConfig();
      break;
    case "dynamic":
      await testDynamicConfig();
      break;
    case "ratelimit":
      await testRateLimit();
      break;
    case "all":
    default:
      const success = await generateConfigReport();
      process.exit(success ? 0 : 1);
  }
}

main().catch((error) => {
  console.error("💥 Erro crítico:", error);
  process.exit(1);
});
