import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { extractUserId } from "@/utils/auth";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuração de rate limiting
const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;
const createCardRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requisições por minuto
      analytics: true,
    })
  : null;

// Esquema de validação aprimorado
const cardSchema = z.object({
  cardName: z
    .string()
    .min(1, { message: "O nome do cartão é obrigatório" })
    .max(50, { message: "Nome muito longo" })
    .regex(/^[\p{L}\p{N}\s\-\.]+$/u, {
      message: "Nome contém caracteres inválidos",
    })
    .refine((val) => val.trim().length > 0, {
      message: "Nome não pode ser apenas espaços",
    })
    .transform((val) => val.trim()),

  cardNumber: z
    .number()
    .int()
    .min(1000000000000, { message: "Número do cartão inválido" })
    .max(9999999999999999, { message: "Número do cartão inválido" })
    .optional(),

  limit: z
    .number()
    .positive({ message: "Limite deve ser positivo" })
    .max(50000, { message: "Limite muito alto" }),

  dueDay: z
    .number()
    .int()
    .min(1, { message: "Dia inválido" })
    .max(31, { message: "Dia inválido" }),
});

// Função para sanitizar entrada
function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// Função para lidar com requisições POST
export async function POST(req: Request) {
  try {
    // Verificar tamanho do payload
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024) {
      return NextResponse.json(
        { error: "Payload muito grande" },
        { status: 413 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Rate limiting (apenas se Redis estiver configurado)
    if (createCardRateLimit) {
      const { success } = await createCardRateLimit.limit(userId);
      if (!success) {
        return NextResponse.json(
          { error: "Muitas requisições. Tente novamente mais tarde." },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const sanitizedBody = {
      cardName: sanitizeInput(body.cardName),
      cardNumber: body.cardNumber,
      limit: body.limit,
      dueDay: body.dueDay,
    };

    const parsedData = cardSchema.safeParse(sanitizedBody);

    if (!parsedData.success) {
      const validationErrors = parsedData.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: "VALIDATION_ERROR",
      }));

      return NextResponse.json(
        {
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          validationErrors,
        },
        { status: 400 }
      );
    }

    const { cardName, cardNumber, limit, dueDay } = parsedData.data;

    const existingCardByName = await prisma.card.findFirst({
      where: { userId, name: cardName },
    });

    const existingCardByNumber = cardNumber
      ? await prisma.card.findFirst({
          where: { userId, number: cardNumber },
        })
      : null;

    if (existingCardByName || existingCardByNumber) {
      return NextResponse.json(
        { error: "Já existe um cartão com este nome ou número" },
        { status: 400 }
      );
    }

    const newCard = await prisma.card.create({
      data: {
        name: cardName,
        number: cardNumber,
        limit: limit,
        dueDay: dueDay,
        userId: userId,
      },
    });

    return NextResponse.json(
      {
        id: newCard.id,
        name: newCard.name,
        limit: newCard.limit,
        dueDay: newCard.dueDay,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar cartão:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Conflito de dados: já existe um cartão com esses valores" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Erro interno do servidor. Por favor, tente novamente mais tarde.",
      },
      { status: 500 }
    );
  }
}

// Função para lidar com requisições GET
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Parâmetros de paginação inválidos" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const cards = await prisma.card.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        number: true,
        limit: true,
        dueDay: true,
      },
      skip,
      take: limit,
    });

    const totalCards = await prisma.card.count({ where: { userId } });

    return NextResponse.json(
      {
        data: cards,
        pagination: {
          total: totalCards,
          page,
          limit,
          totalPages: Math.ceil(totalCards / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar cartões:", error);
    return NextResponse.json(
      {
        error:
          "Erro interno do servidor. Por favor, tente novamente mais tarde.",
      },
      { status: 500 }
    );
  }
}
