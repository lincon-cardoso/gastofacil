/**
 * Carregador de ambiente para scripts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Carrega as variáveis de ambiente na ordem correta
export function loadEnv() {
  // Primeiro carrega .env.local (mais específico)
  config({ path: resolve(process.cwd(), ".env.local") });

  // Depois carrega .env (padrão)
  config({ path: resolve(process.cwd(), ".env") });

  console.log("🌍 Variáveis de ambiente carregadas:");
  console.log("• APP_ENV:", process.env.APP_ENV);
  console.log(
    "• UPSTASH_REDIS_REST_URL:",
    process.env.UPSTASH_REDIS_REST_URL ? "✅ Definida" : "❌ Não definida"
  );
  console.log(
    "• NEXTAUTH_SECRET:",
    process.env.NEXTAUTH_SECRET ? "✅ Definida" : "❌ Não definida"
  );
  console.log("• NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
}
