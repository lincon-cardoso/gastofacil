import NextAuth from "next-auth";
import { authOptions } from "@/utils/auth-options";

// Handler para rotas de autenticação (session, signin, callback etc.)
const handler = NextAuth(authOptions);

// Exportar métodos HTTP necessários para App Router
export { handler as GET, handler as POST };

// Configurações runtime para garantir que funcione corretamente
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
