import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { clearUserUpstashData } from "@/middleware";

type JwtWithJti = {
  sub?: string | null;
  jti?: string | null;
  role?: string | null;
};

// Encerra a sessão e limpa todos os dados do usuário no Upstash
// POST /api/auth/logout
export async function POST(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JwtWithJti | null;

    if (!token?.sub) {
      return NextResponse.json(
        {
          ok: true,
          cleared: false,
          reason: "no_user_session",
        },
        { status: 200 }
      );
    }

    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!upstashUrl || !upstashToken) {
      // Sem Upstash configurado, apenas retorna ok para não bloquear o fluxo de logout
      return NextResponse.json(
        {
          ok: true,
          cleared: false,
          reason: "upstash_not_configured",
        },
        { status: 200 }
      );
    }

    // Usa a nova função de limpeza completa do middleware
    const cleanupResult = await clearUserUpstashData(token.sub);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[logout] Resultado da limpeza para usuário ${token.sub}:`, {
        success: cleanupResult.success,
        clearedKeysCount: cleanupResult.clearedKeys.length,
        clearedKeys: cleanupResult.clearedKeys,
        error: cleanupResult.error,
      });
    }

    // Fallback: se a função nova falhou, tenta o método antigo
    if (!cleanupResult.success) {
      console.warn(
        "[logout] Limpeza completa falhou, tentando método legacy..."
      );

      try {
        const key = `session:${token.sub}`;
        const jti = token?.jti ?? undefined;
        const baseUrl = upstashUrl.replace(/\/$/, "");

        let legacyCleared = false;

        if (jti) {
          // Deleta somente se o valor armazenado for igual ao JTI da sessão atual (CAS)
          const script =
            "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end";
          const res = await fetch(`${baseUrl}/pipeline`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${upstashToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify([["EVAL", script, "1", key, jti]]),
          });

          if (res.ok) {
            const data = (await res.json()) as Array<{ result: number }>;
            legacyCleared = Number(data?.[0]?.result ?? 0) > 0;
          }
        }

        return NextResponse.json(
          {
            ok: true,
            cleared: legacyCleared,
            method: "legacy",
            fallback: true,
          },
          { status: 200 }
        );
      } catch (legacyError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[logout] Fallback também falhou:", legacyError);
        }

        return NextResponse.json(
          {
            ok: true,
            cleared: false,
            error: "cleanup_failed",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        ok: true,
        cleared: cleanupResult.success,
        clearedKeysCount: cleanupResult.clearedKeys.length,
        method: "complete_cleanup",
      },
      { status: 200 }
    );
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[logout] Erro inesperado:", e);
    }
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_error",
      },
      { status: 500 }
    );
  }
}

// Garante execução a cada requisição e que cookies sejam considerados
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Opcional: trata GET como logout também (idempotente)
export async function GET(req: NextRequest) {
  return POST(req);
}
