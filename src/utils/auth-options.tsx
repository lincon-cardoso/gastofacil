// Configurações de autenticação para NextAuth.js
// Define como os usuários fazem login e são autenticados na aplicação
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { loginSchema } from "./validation";
import type { Role } from "@prisma/client";

// Interface personalizada para definir os dados do usuário logado
interface CustomUser {
  id: string;
  name: string;
  email: string;
  role?: Role; // Papel do usuário (admin, user, etc.)
  plan?: {
    id: string;
    name: string;
    price: number;
  }; // Plano de assinatura do usuário
}

// Configuração principal do NextAuth
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // Usa JSON Web Tokens para manter a sessão
    maxAge: 24 * 60 * 60, // Sessão expira em 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET, // Chave secreta para assinar tokens
  pages: {
    signIn: "/login", // Página customizada de login
    error: "/login", // Redireciona erros para página de login
  },
  providers: [
    // Provedor de autenticação por email e senha
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      // Função que verifica se as credenciais são válidas
      async authorize(raw) {
        try {
          // Valida os dados de entrada usando Zod
          const parsed = loginSchema.safeParse(raw);
          if (!parsed.success) {
            console.error("Erro na validação dos dados de login");
            return null;
          }

          const { email, password } = parsed.data;

          // Busca o usuário no banco de dados
          const user = await prisma.user.findUnique({
            where: { email },
            include: { plan: true }, // Inclui dados do plano do usuário
          });

          if (!user) {
            console.error("Usuário não encontrado");
            return null;
          }

          try {
            // Verifica se a senha está correta usando hash
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

          // Retorna os dados do usuário autenticado
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
    // Callback executado quando um JWT é criado
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.uid = customUser.id; // Adiciona ID do usuário ao token
        token.plan = customUser.plan; // Adiciona plano ao token
        token.role = customUser.role; // Adiciona papel ao token
        token.jti = Date.now().toString(); // Identificador único do token
      }
      return token;
    },
    // Callback executado quando uma sessão é acessada
    async session({ session, token }) {
      try {
        if (token.uid) {
          session.userId = token.uid as string;

          // Busca dados atualizados do usuário no banco
          const dbUser = await prisma.user.findUnique({
            where: { id: token.uid as string },
            include: { plan: true },
          });

          if (dbUser) {
            // Atualiza os dados da sessão com informações do banco
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
