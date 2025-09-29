// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { loginSchema } from "./validation";
import { Session, User as NextAuthUser } from "next-auth";
import type { Role } from "@prisma/client";

interface CustomUser extends NextAuthUser {
  plan?: {
    id: string;
    name: string;
    price: number;
  };
  role?: Role;
}

// Session já é augmentado em src/types/next-auth.d.ts para conter userId, role e plan

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("Erro na validação dos dados de login", {
            issues: parsed.error.issues,
          });
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email },
          include: { plan: true }, // Inclui o relacionamento com o plano
        });
        if (!user) {
          console.error("Usuário não encontrado", { email });
          return null;
        }

        const { verifyPassword } = await import("./hash");
        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) {
          console.error("Senha inválida para o usuário", { email });
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          role: user.role,
          plan:
            user.plan != null
              ? {
                  id: user.plan.id,
                  name: user.plan.name,
                  price: user.plan.price,
                }
              : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.uid = customUser.id;
        token.plan = customUser.plan; // Adiciona o plano ao token
        token.role = customUser.role; // adiciona role ao token
        // Garante que o token tenha um identificador único (jti) para controle de sessão única
        if (!token.jti) {
          try {
            // Usa Web Crypto randomUUID se disponível
            if (
              typeof crypto !== "undefined" &&
              "randomUUID" in
                (crypto as unknown as { randomUUID?: () => string })
            ) {
              token.jti = (
                crypto as unknown as { randomUUID: () => string }
              ).randomUUID();
            } else {
              token.jti =
                Math.random().toString(36).slice(2) + Date.now().toString(36);
            }
          } catch {
            token.jti =
              Math.random().toString(36).slice(2) + Date.now().toString(36);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // popula campos extras na sessão
      const uid = typeof token.uid === "string" ? token.uid : undefined;
      session.userId = uid;

      // Busca dados atualizados do usuário no banco para refletir alterações em tempo real (nome, email, plano, role)
      if (uid) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: uid },
            include: { plan: true },
          });

          if (dbUser) {
            session.user = {
              ...session.user,
              name: dbUser.name ?? session.user?.name ?? "",
              email: dbUser.email ?? session.user?.email ?? undefined,
              role:
                dbUser.role ?? (token.role as CustomUser["role"]) ?? undefined,
              plan: dbUser.plan
                ? {
                    id: dbUser.plan.id,
                    name: dbUser.plan.name,
                    price: dbUser.plan.price,
                  }
                : undefined,
            } as CustomUser;
            return session as Session;
          }
        } catch {
          // Se houver erro no acesso ao banco, faz fallback para dados do token
        }
      }

      // Fallback caso não consiga buscar do banco
      session.user = {
        ...session.user,
        plan: token.plan,
        role: token.role,
      } as CustomUser;
      return session as Session;
    },
  },
};
