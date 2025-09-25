// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./hash";
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
      }
      return token;
    },
    async session({ session, token }) {
      // popula campos extras na sessão
      session.userId = typeof token.uid === "string" ? token.uid : undefined;
      session.user = {
        ...session.user,
        plan: token.plan,
        role: token.role,
      } as CustomUser;
      return session as Session;
    },
  },
};
