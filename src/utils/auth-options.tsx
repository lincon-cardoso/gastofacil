// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { loginSchema } from "./validation";
import type { Role } from "@prisma/client";

interface CustomUser {
  id: string;
  name: string;
  email: string;
  role?: Role;
  plan?: {
    id: string;
    name: string;
    price: number;
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        try {
          const parsed = loginSchema.safeParse(raw);
          if (!parsed.success) {
            console.error("Erro na validação dos dados de login");
            return null;
          }

          const { email, password } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { email },
            include: { plan: true },
          });

          if (!user) {
            console.error("Usuário não encontrado");
            return null;
          }

          try {
            const { verifyPassword } = await import("./hash");
            const valid = await verifyPassword(user.passwordHash, password);
            if (!valid) {
              console.error("Senha inválida");
              return null;
            }
          } catch (error) {
            console.error("Erro ao verificar senha:", error);
            return null;
          }

          return {
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            role: user.role,
            plan: user.plan
              ? {
                  id: user.plan.id,
                  name: user.plan.name,
                  price: user.plan.price,
                }
              : undefined,
          };
        } catch (error) {
          console.error("Erro geral na autorização:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.uid = customUser.id;
        token.plan = customUser.plan;
        token.role = customUser.role;
        token.jti = Date.now().toString();
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (token.uid) {
          session.userId = token.uid as string;

          // Busca dados atualizados do usuário
          const dbUser = await prisma.user.findUnique({
            where: { id: token.uid as string },
            include: { plan: true },
          });

          if (dbUser) {
            session.user = {
              ...session.user,
              name: dbUser.name ?? "",
              email: dbUser.email,
              role: dbUser.role,
              plan: dbUser.plan
                ? {
                    id: dbUser.plan.id,
                    name: dbUser.plan.name,
                    price: dbUser.plan.price,
                  }
                : undefined,
            };
          }
        }
        return session;
      } catch (error) {
        console.error("Erro no callback de sessão:", error);
        return session;
      }
    },
  },
};
