// Importações necessárias para a rota
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { createBudgetSchema } from "@/schemas/budget";
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
    const parsed = createBudgetSchema.safeParse({
      name: body?.name ?? body?.budgetName,
      amount: body?.amount ?? body?.value,
    });

    // retorna erro caso os dados sejam invalidos
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    // dados validos

    const { name, amount } = parsed.data;

    // Verifica se ja existe um orcamento com o mesmo nome

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: "Já existe um orçamento com esse nome" },
        { status: 409 }
      );
    }

    // cria o orcamento no banco de dados

    const newBudget = await prisma.budget.create({
      data: {
        name,
        amount,
        userId,
      },
      select: {
        id: true,
        name: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ budget: newBudget }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar meta:", error);

    //    trata erros conhecidos prisma

    // Trata erros conhecidos do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Orçamento com valores duplicados ou conflito de constraint",
          },
          { status: 409 }
        );
      }
    }

    // Retorna erro genérico
    return NextResponse.json(
      { error: "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}

// funcao para obter todas as metas do usuario autenticado

export async function GET() {
  try {
    // obtem a sessao do usuario autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // verifica se o usuario esta autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // busca todas as metas do usuario no banco de dados
    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    // retorna as metas encontradas
      return NextResponse.json(budgets);
      
  } catch (error) {
    console.error("GET /api/metas error", error);

    // Retorna erro genérico
    return NextResponse.json(
      { error: "Erro ao listar metas" },
      { status: 500 }
    );
  }
}

// configuracao dinamica e de run time

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
