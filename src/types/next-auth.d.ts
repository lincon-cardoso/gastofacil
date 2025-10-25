// Extensão dos tipos do NextAuth para incluir dados customizados do usuário
import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Estende a interface Session do NextAuth para incluir campos personalizados
declare module "next-auth" {
  interface Session {
    userId?: string; // ID único do usuário no banco de dados
    user: DefaultSession["user"] & {
      role?: Role; // Papel/função do usuário (admin, user, etc.) vindo do Prisma
      plan?: {
        id: string; // ID do plano de assinatura
        name: string; // Nome do plano (básico, premium, etc.)
        price: number; // Preço do plano
      };
    };
  }
}

// Estende a interface JWT do NextAuth para incluir dados no token
declare module "next-auth/jwt" {
  interface JWT {
    uid?: string; // ID do usuário para incluir no token JWT
    role?: Role; // Papel do usuário para incluir no token
    jti?: string; // JWT ID - identificador único do token
    plan?: {
      id: string; // Dados do plano para incluir no token
      name: string;
      price: number;
    };
  }
}
