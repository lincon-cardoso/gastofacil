import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type JwtWithJti = {
  sub?: string | null;
  jti?: string | null;
};

// Encerra a sessão única no Upstash antes do signOut do NextAuth.
// POST /api/auth/logout
export async function POST(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JwtWithJti | null;
    if (!token?.sub) {
      return NextResponse.json({ ok: true, cleared: false }, { status: 200 });
    }

    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!upstashUrl || !upstashToken) {
      // Sem Upstash configurado, apenas retorna ok para não bloquear o fluxo de logout
      return NextResponse.json(
        { ok: true, cleared: false, reason: "upstash_not_configured" },
        { status: 200 }
      );
    }

    const key = `session:${token.sub}`;
    const jti = token?.jti ?? undefined;

    let cleared = false;
    try {
      const baseUrl = upstashUrl.replace(/\/$/, "");

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
        if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
        const data = (await res.json()) as Array<{ result: number }>;
        cleared = Number(data?.[0]?.result ?? 0) > 0;

        // Fallback: se CAS não removeu (provável jti diferente), faz DEL incondicional
        if (!cleared) {
          const resDel = await fetch(`${baseUrl}/pipeline`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${upstashToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify([["DEL", key]]),
          });
          if (!resDel.ok) throw new Error(`Upstash HTTP ${resDel.status}`);
          const dataDel = (await resDel.json()) as Array<{ result: number }>;
          cleared = Number(dataDel?.[0]?.result ?? 0) > 0;
        }
      } else {
        // Sem jti, faz DEL incondicional (menos preciso)
        const res = await fetch(`${baseUrl}/pipeline`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${upstashToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([["DEL", key]]),
        });
        if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
        const data = (await res.json()) as Array<{ result: number }>;
        cleared = Number(data?.[0]?.result ?? 0) > 0;
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[logout] Falha ao limpar sessão no Upstash:", e);
      }
      // Não falha o logout do usuário por causa de erro de infraestrutura
      return NextResponse.json({ ok: true, cleared: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true, cleared }, { status: 200 });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[logout] Erro inesperado:", e);
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Garante execução a cada requisição e que cookies sejam considerados
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Opcional: trata GET como logout também (idempotente)
export async function GET(req: NextRequest) {
  return POST(req);
}
