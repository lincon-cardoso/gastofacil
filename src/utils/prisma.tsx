// Configuração do cliente Prisma para conexão com o banco de dados
import { PrismaClient } from "@prisma/client";

// Declaração global para evitar múltiplas instâncias do Prisma em desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Cria uma instância única do Prisma (Singleton pattern)
// Reutiliza a instância global em desenvolvimento para evitar reconexões
export const prisma =
  globalForPrisma.prisma ?? // Se já existe uma instância global, usa ela
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // URL de conexão do banco (configurada no .env)
      },
    },
  });

// Em desenvolvimento, salva a instância globalmente para reutilização
// Evita criar múltiplas conexões durante hot-reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
