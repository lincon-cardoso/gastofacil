import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Tipo para o token JWT com informações do usuário
type JwtToken = {
  sub?: string | null; // ID do usuário
  role?: string | null; // Função/papel do usuário
};

/**
 * Rota de logout - Encerra a sessão do usuário
 * Esta rota é responsável por processar solicitações de logout
 * e validar se existe uma sessão ativa para o usuário
 */
export async function POST(req: NextRequest) {
  try {
    // Extrai o token JWT da requisição usando o secret do NextAuth
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JwtToken | null;

    // Verifica se existe um token válido com ID de usuário
    if (!token?.sub) {
      return NextResponse.json(
        {
          ok: true,
          message: "Nenhuma sessão ativa encontrada",
          reason: "no_user_session",
        },
        { status: 200 }
      );
    }

    // Log para auditoria (opcional)
    console.log(`[logout] Usuário ${token.sub} realizou logout`);

    // Retorna sucesso - a limpeza real da sessão é feita pelo NextAuth
    // através dos cookies e mecanismos internos
    return NextResponse.json(
      {
        ok: true,
        message: "Logout realizado com sucesso",
        userId: token.sub,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log do erro para debugging
    console.error("[logout] Erro inesperado durante logout:", error);

    // Retorna erro interno do servidor
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno do servidor",
        error: "unexpected_error",
      },
      { status: 500 }
    );
  }
}

/**
 * Configurações de cache e execução para a rota
 * - dynamic: "force-dynamic" força a execução a cada requisição
 * - revalidate: 0 desabilita o cache da resposta
 * Isso garante que o logout sempre execute e não seja cacheado
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Método GET - Trata requisições GET como logout também
 * Alguns clientes podem fazer GET em vez de POST para logout
 * Esta implementação garante que ambos os métodos funcionem (idempotente)
 */
export async function GET(req: NextRequest) {
  return POST(req);
}
