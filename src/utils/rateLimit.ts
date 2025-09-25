import { NextResponse } from "next/server";
import Redis from "ioredis";
import pino from "pino";
import { prometheusClient } from "@/utils/prometheus";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const RATE_LIMIT_WINDOW = 60; // 1 minuto (em segundos)
const MAX_REQUESTS = 5;

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const rateLimitAbuseCounter = new prometheusClient.Counter({
  name: "rate_limit_abuse_total",
  help: "Contador de abusos de rate limit",
  labelNames: ["key"],
});

export default async function rateLimit(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwarded?.split(",")[0] || realIp || "unknown").trim();
  const key = `rate-limit:${ip}:register`;

  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }

  if (currentCount > MAX_REQUESTS) {
    logRateLimitExceeded(key);
    return NextResponse.json(
      {
        errors: { general: "Muitas requisições. Tente novamente mais tarde." },
      },
      { status: 429 }
    );
  }

  return undefined;
}

export const logRateLimitExceeded = (key: string) => {
  logger.warn({ key }, "Rate limit exceeded");
  rateLimitAbuseCounter.inc({ key });
};
