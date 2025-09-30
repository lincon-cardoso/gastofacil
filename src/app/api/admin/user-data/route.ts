import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Redis } from "@upstash/redis";

type JwtWithRole = {
  sub?: string | null;
  role?: string | null;
};

// Endpoint administrativo para visualizar dados do Upstash de um usuário
// GET /api/admin/user-data?userId=xxx
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

    // Parse dos parâmetros
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Parâmetro 'userId' é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se Redis está disponível
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      return NextResponse.json(
        { error: "Upstash não configurado" },
        { status: 503 }
      );
    }

    const redis = Redis.fromEnv();

    // Lista de padrões de chaves relacionadas ao usuário
    const keyPatterns = [
      `session:${userId}`,
      `user_sessions:${userId}`,
      `security:ips:${userId}`,
      `security:ua:${userId}`,
      `metrics:user:${userId}`,
      `rate_limit:${userId}`,
    ];

    const userData: Record<string, unknown> = {};

    // Recupera dados para cada padrão
    for (const pattern of keyPatterns) {
      try {
        if (pattern.includes("*")) {
          // Para padrões com wildcard, usa SCAN
          const keys = await redis.keys(pattern);
          for (const key of keys) {
            const value = await redis.get(key);
            userData[key] = value;
          }
        } else {
          // Para chaves específicas
          const value = await redis.get(pattern);
          if (value !== null) {
            userData[pattern] = value;
          }
        }
      } catch (keyError) {
        userData[pattern] = {
          error:
            keyError instanceof Error ? keyError.message : "Erro desconhecido",
        };
      }
    }

    // Busca também chaves com padrões dinâmicos
    try {
      const dynamicPatterns = [`anomaly:${userId}:*`, `cache:user:${userId}:*`];

      for (const pattern of dynamicPatterns) {
        const keys = await redis.keys(pattern);
        for (const key of keys) {
          try {
            const value = await redis.get(key);
            userData[key] = value;
          } catch (e) {
            userData[key] = {
              error: e instanceof Error ? e.message : "Erro na leitura",
            };
          }
        }
      }
    } catch (scanError) {
      userData._scanError =
        scanError instanceof Error ? scanError.message : "Erro no scan";
    }

    // Log da consulta administrativa
    console.log(`[ADMIN] Consulta de dados do usuário:`, {
      adminUser: token.sub,
      targetUser: userId,
      keysFound: Object.keys(userData).length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      userId,
      data: userData,
      keysCount: Object.keys(userData).length,
      consultedBy: token.sub,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN] Erro na consulta administrativa:", error);
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
