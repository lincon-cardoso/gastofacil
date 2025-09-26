import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type JwtWithJti = {
  sub?: string | null;
  jti?: string | null;
};

// Renova o TTL da sessão única no Upstash quando o usuário está ativo no app.
// GET /api/auth/keep-alive
export async function GET(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JwtWithJti | null;
    if (!token?.sub || !token?.jti) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const ttl = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24);

    if (!upstashUrl || !upstashToken) {
      return NextResponse.json({ ok: true, renewed: false }, { status: 200 });
    }

    const key = `session:${token.sub}`;
    const base = upstashUrl.replace(/\/$/, "");

    // Renova TTL somente se a sessão atual for do mesmo jti (CAS)
    const script =
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('EXPIRE', KEYS[1], ARGV[2]) else return 0 end";
    const res = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["EVAL", script, "1", key, token.jti, `${ttl}`]]),
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    const data = (await res.json()) as Array<{ result: number }>;
    const renewed = Number(data?.[0]?.result ?? 0) > 0;
    return NextResponse.json({ ok: true, renewed }, { status: 200 });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[keep-alive] erro:", e);
    }
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

// Evita cache e garante execução em toda chamada
export const dynamic = "force-dynamic";
export const revalidate = 0;
