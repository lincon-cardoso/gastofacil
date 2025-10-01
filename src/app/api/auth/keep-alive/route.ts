import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define o tipo para o token JWT com os campos sub e jti
type JwtWithJti = {
  sub?: string | null;
  jti?: string | null;
};

// Função para renovar o TTL da sessão no Upstash
export async function GET(req: NextRequest) {
  try {
    // Obtém o token JWT da requisição
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JwtWithJti | null;

    // Verifica se o token possui os campos necessários
    if (!token?.sub || !token?.jti) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // Obtém as variáveis de ambiente necessárias
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const ttl = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24);

    // Retorna caso as variáveis de ambiente não estejam configuradas
    if (!upstashUrl || !upstashToken) {
      return NextResponse.json({ ok: true, renewed: false }, { status: 200 });
    }

    // Define a chave da sessão e ajusta a URL base do Upstash
    const key = `session:${token.sub}`;
    const base = upstashUrl.replace(/\/$/, "");

    // Script Lua para renovar o TTL da sessão no Redis
    const script =
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('EXPIRE', KEYS[1], ARGV[2]) else return 0 end";

    // Faz a requisição ao Upstash para executar o script
    const res = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["EVAL", script, "1", key, token.jti, `${ttl}`]]),
    });

    // Lança erro caso a requisição falhe
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);

    // Processa a resposta e verifica se o TTL foi renovado
    const data = (await res.json()) as Array<{ result: number }>;

    const renewed = Number(data?.[0]?.result ?? 0) > 0;

    // Retorna o resultado da operação
    return NextResponse.json({ ok: true, renewed }, { status: 200 });
  } catch (e) {
    // Loga o erro no ambiente de desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      console.warn("[keep-alive] erro:", e);
    }

    // Retorna uma resposta de erro genérica
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

// Configurações para evitar cache e garantir execução dinâmica
export const dynamic = "force-dynamic";
export const revalidate = 0;
