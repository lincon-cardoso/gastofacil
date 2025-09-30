/**
 * Script para inicializar as configurações do middleware no Redis
 * Execute: npx tsx scripts/init-middleware-config.ts
 */

import { loadEnv } from "./load-env";

// Carrega variáveis de ambiente ANTES de importar Redis
loadEnv();

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

interface MiddlewareConfig {
  sessionMode: "single" | "multi";
  anomalyDetection: boolean;
  metricsEnabled: boolean;
  maintenanceMode: boolean;
}

async function initializeMiddlewareConfig() {
  try {
    // Configuração padrão recomendada para desenvolvimento
    const defaultConfig: MiddlewareConfig = {
      sessionMode: "single", // Modo sessão única (apenas um login por usuário)
      anomalyDetection: true, // Detectar comportamentos suspeitos
      metricsEnabled: true, // Coletar métricas de performance
      maintenanceMode: false, // Sistema ativo (não em manutenção)
    };

    // Verifica se já existe configuração
    const existingConfig = await redis.get("middleware:config");

    if (existingConfig) {
      console.log("✅ Configuração do middleware já existe:");
      console.log(
        JSON.stringify(JSON.parse(existingConfig as string), null, 2)
      );
      return;
    }

    // Salva a configuração no Redis
    await redis.set("middleware:config", JSON.stringify(defaultConfig));

    console.log("🚀 Configuração do middleware inicializada com sucesso:");
    console.log(JSON.stringify(defaultConfig, null, 2));

    // Informações adicionais sobre as configurações
    console.log("\n📋 Explicação das configurações:");
    console.log(
      "• sessionMode: 'single' = apenas um login por usuário, 'multi' = múltiplos dispositivos"
    );
    console.log(
      "• anomalyDetection: detecta IPs múltiplos e mudanças de User-Agent"
    );
    console.log("• metricsEnabled: coleta métricas de performance e requests");
    console.log(
      "• maintenanceMode: quando true, retorna 503 para todas as rotas"
    );
  } catch (error) {
    console.error("❌ Erro ao inicializar configuração do middleware:", error);
    process.exit(1);
  }
}

async function showCurrentConfig() {
  try {
    const config = await redis.get("middleware:config");
    if (config) {
      console.log("📊 Configuração atual do middleware:");

      // Verifica o tipo da resposta
      if (typeof config === "string") {
        console.log(JSON.stringify(JSON.parse(config), null, 2));
      } else if (typeof config === "object" && config !== null) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(
          "⚠️ Formato de configuração não reconhecido:",
          typeof config
        );
        console.log(config);
      }
    } else {
      console.log("⚠️ Nenhuma configuração encontrada no Redis");
    }
  } catch (error) {
    console.error("❌ Erro ao buscar configuração:", error);

    // Tenta limpar e recriar
    console.log("🔧 Tentando limpar configuração corrompida...");
    try {
      await redis.del("middleware:config");
      console.log("✅ Configuração corrompida removida");
    } catch (deleteError) {
      console.error("❌ Erro ao remover configuração:", deleteError);
    }
  }
}

// Script principal
async function main() {
  const command = process.argv[2];

  switch (command) {
    case "init":
      await initializeMiddlewareConfig();
      break;
    case "show":
      await showCurrentConfig();
      break;
    case "reset":
      await redis.del("middleware:config");
      console.log("🗑️ Configuração removida do Redis");
      await initializeMiddlewareConfig();
      break;
    default:
      console.log("📖 Uso:");
      console.log(
        "  npx tsx scripts/init-middleware-config.ts init   # Inicializar configuração"
      );
      console.log(
        "  npx tsx scripts/init-middleware-config.ts show   # Mostrar configuração atual"
      );
      console.log(
        "  npx tsx scripts/init-middleware-config.ts reset  # Resetar configuração"
      );
  }
}

main().catch(console.error);
