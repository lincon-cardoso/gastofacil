// Importações necessárias para a rota
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { createGoalSchema } from "@/schemas/goal";
import { extractUserId } from "@/utils/auth";

// função para criar metas

export async function POST(req: Request) {
  try {
    //   obtem a sessao do usuario autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // verifica se o usuario esta autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // le e valida os dados do corpor da requisição

    const body = await req.json().catch(() => ({}));
    const parsed = createGoalSchema.safeParse({
      name: body?.name ?? body?.goalName,
      targetAmount: Number(body?.targetAmount ?? body?.value),
      deadline: body?.deadline,
    });

    // retorna erro caso os dados sejam invalidos
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    // dados validos

    const { name, targetAmount, deadline } = parsed.data;

    // Verifica se ja existe uma meta com o mesmo nome

    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingGoal) {
      return NextResponse.json(
        { error: "Já existe uma meta com esse nome" },
        { status: 409 }
      );
    }

    // cria a meta no banco de dados

    const newGoal = await prisma.goal.create({
      data: {
        name,
        targetAmount,
        deadline,
        userId,
      },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        currentAmount: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ goal: newGoal }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar meta:", error);

    //    trata erros conhecidos prisma

    // Trata erros conhecidos do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Meta com valores duplicados ou conflito de constraint",
          },
          { status: 409 }
        );
      }
    }

    // Retorna erro genérico
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}

// configuracao dinamica e de run time

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
