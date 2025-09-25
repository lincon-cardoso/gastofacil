import NextAuth from "next-auth";
import { authOptions } from "@/utils/auth-options";

// Handler para rotas de autenticação (session, signin, callback etc.)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
