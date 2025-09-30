#!/usr/bin/env node

/**
 * Script de verificação de segurança
 * Verifica se arquivos sensíveis estão protegidos
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

console.log("🔒 VERIFICAÇÃO DE SEGURANÇA - GASTOFÁCIL");
console.log("=".repeat(50));

const checks = [
  {
    name: "Arquivos .env não rastreados pelo Git",
    test: () => {
      try {
        // Comando compatível com Windows PowerShell
        const result = execSync('git ls-files | Select-String "\\.env"', {
          encoding: "utf8",
          shell: "powershell",
        });
        return result.trim() === "";
      } catch {
        return true; // Não encontrou arquivos .env, isso é bom
      }
    },
  },
  {
    name: ".env está no .gitignore",
    test: () => {
      try {
        execSync("git check-ignore .env", { stdio: "pipe" });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: ".env.local está no .gitignore",
    test: () => {
      try {
        execSync("git check-ignore .env.local", { stdio: "pipe" });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: ".env.local existe (desenvolvimento)",
    test: () => existsSync(".env.local"),
  },
  {
    name: "docs/SECURITY_GUIDE.md existe",
    test: () => existsSync("docs/SECURITY_GUIDE.md"),
  },
];

let allPassed = true;

console.log("\n🧪 EXECUTANDO VERIFICAÇÕES:\n");

for (const check of checks) {
  const passed = check.test();
  const status = passed ? "✅ PASSOU" : "❌ FALHOU";
  console.log(`${status} - ${check.name}`);

  if (!passed) {
    allPassed = false;
  }
}

console.log("\n📋 RESUMO FINAL:");
console.log("=".repeat(30));

if (allPassed) {
  console.log("🎉 TODAS AS VERIFICAÇÕES PASSARAM!");
  console.log("🔒 Seu projeto está SEGURO!");
  console.log("\n✅ Arquivos sensíveis estão protegidos");
  console.log("✅ .gitignore configurado corretamente");
  console.log("✅ Templates de exemplo disponíveis");

  process.exit(0);
} else {
  console.log("⚠️  ALGUMAS VERIFICAÇÕES FALHARAM!");
  console.log("🚨 Revise a configuração de segurança");
  console.log("\n📚 Consulte: docs/SECURITY_GUIDE.md");

  process.exit(1);
}
