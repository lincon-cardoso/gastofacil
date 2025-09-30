import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkUpstashHealth } from "@/middleware";

type JwtWithRole = {
  sub?: string | null;
  role?: string | null;
};

// Endpoint administrativo para verificar a saúde do Upstash
// GET /api/admin/upstash-health
export async function GET(req: NextRequest) {
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

    // Verifica saúde do Upstash
    const healthCheck = await checkUpstashHealth();

    // Log da verificação
    console.log(`[ADMIN] Verificação de saúde do Upstash:`, {
      adminUser: token.sub,
      connected: healthCheck.connected,
      latency: healthCheck.latency,
      error: healthCheck.error,
      timestamp: new Date().toISOString(),
    });

    const responseData = {
      connected: healthCheck.connected,
      latency: healthCheck.latency,
      error: healthCheck.error,
      configuration: {
        hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        environment: process.env.NODE_ENV,
      },
      checkedBy: token.sub,
      timestamp: new Date().toISOString(),
    };

    const status = healthCheck.connected ? 200 : 503;

    return NextResponse.json(responseData, { status });
  } catch (error) {
    console.error("[ADMIN] Erro na verificação de saúde:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        connected: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Garante execução a cada requisição
export const dynamic = "force-dynamic";
export const revalidate = 0;
