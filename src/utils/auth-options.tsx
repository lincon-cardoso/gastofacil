// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./hash";
import { loginSchema } from "./validation";

import { Session, User as NextAuthUser } from "next-auth";

interface CustomUser extends NextAuthUser {
  plan?: {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  };
}

interface CustomSession extends Session {
  userId?: string;
  user?: CustomUser;
}

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
          plan:
            user.plan != null
              ? {
                  id: user.plan.id,
                  name: user.plan.name,
                  price: user.plan.price,
                  description: user.plan.description,
                  features: user.plan.features,
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
      }
      return token;
    },
    async session({ session, token }) {
      const customSession = session as CustomSession;
      customSession.userId =
        typeof token.uid === "string" ? token.uid : undefined;
      customSession.user = {
        ...session.user,
        plan: token.plan, // Adiciona o plano à sessão
      } as CustomUser;
      return customSession;
    },
  },
};
