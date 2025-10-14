import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { extractUserId } from "@/utils/auth";
import { z } from "zod";

const createCardSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  limit: z.number().min(0, "Limite deve ser positivo").optional().default(0),
  dueDay: z
    .number()
    .min(1, "Dia de fechamento deve ser entre 1 e 31")
    .max(31, "Dia de fechamento deve ser entre 1 e 31")
    .optional()
    .default(1),
});

export async function POST(req: Request) {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // Verifica se o usuário está autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Lê e valida os dados do corpo da requisição
    const body = await req.json().catch(() => ({}));

    const parsed = createCardSchema.safeParse(body);

    // Retorna erro caso os dados sejam inválidos
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, limit, dueDay } = parsed.data;

    // Verifica se já existe um cartão com o mesmo nome para o usuário
    const existingCard = await prisma.card.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "Já existe um cartão com esse nome" },
        { status: 409 }
      );
    }

    // Cria o cartão no banco de dados
    const newCard = await prisma.card.create({
      data: {
        name,
        limit,
        dueDay,
        userId,
      },
      select: {
        id: true,
        name: true,
        limit: true,
        dueDay: true,
      },
    });

    return NextResponse.json({ card: newCard }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cartão:", error);

    // Trata erros conhecidos do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Cartão com valores duplicados ou conflito de constraint",
          },
          { status: 409 }
        );
      }
    }

    // Retorna erro genérico
    return NextResponse.json(
      { error: "Erro ao criar cartão" },
      { status: 500 }
    );
  }
}

// Configuração dinâmica e de runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
