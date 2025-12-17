// Configuração do cliente Prisma para conexão com o banco de dados
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Declaração global para evitar múltiplas instâncias do Prisma em desenvolvimento
const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

// Cria uma instância única do Prisma (Singleton pattern)
// Reutiliza a instância global em desenvolvimento para evitar reconexões
export const prisma =
  globalForPrisma.prisma ?? // Se já existe uma instância global, usa ela
  (() => {
    const pool =
      globalForPrisma.prismaPool ??
      new Pool({
        connectionString: process.env.DATABASE_URL,
      });

    const client = new PrismaClient({
      adapter: new PrismaPg(pool),
    });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaPool = pool;
    }

    return client;
  })();

// Em desenvolvimento, salva a instância globalmente para reutilização
// Evita criar múltiplas conexões durante hot-reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
