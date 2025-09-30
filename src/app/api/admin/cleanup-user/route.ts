import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { clearUserUpstashData } from "@/middleware";

type JwtWithRole = {
  sub?: string | null;
  role?: string | null;
};

// Endpoint administrativo para limpar dados do Upstash de um usuário específico
// POST /api/admin/cleanup-user
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação e autorização
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JwtWithRole | null;

    if (!token?.sub) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado - privilégios de administrador necessários" },
        { status: 403 }
      );
    }

    // Parse do corpo da requisição
    const body = await req.json();
    const { userId, reason } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Campo 'userId' é obrigatório e deve ser uma string" },
        { status: 400 }
      );
    }

    // Executa limpeza
    const cleanupResult = await clearUserUpstashData(userId);

    // Log da ação administrativa
    console.log(`[ADMIN] Limpeza de dados executada:`, {
      adminUser: token.sub,
      targetUser: userId,
      reason: reason || "Não especificado",
      success: cleanupResult.success,
      clearedKeysCount: cleanupResult.clearedKeys.length,
      timestamp: new Date().toISOString(),
    });

    if (!cleanupResult.success) {
      return NextResponse.json(
        {
          error: "Falha na limpeza",
          details: cleanupResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Dados do usuário ${userId} limpos com sucesso`,
      clearedKeysCount: cleanupResult.clearedKeys.length,
      clearedKeys: cleanupResult.clearedKeys,
      executedBy: token.sub,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN] Erro na limpeza administrativa:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Garante execução a cada requisição
export const dynamic = "force-dynamic";
export const revalidate = 0;
