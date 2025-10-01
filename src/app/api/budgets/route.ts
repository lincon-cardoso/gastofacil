// Importações necessárias para a rota
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { createBudgetSchema } from "@/schemas/budget";
import { extractUserId } from "@/utils/auth";

// Função para criar um novo orçamento
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
    const parsed = createBudgetSchema.safeParse({
      name: body?.name ?? body?.budgetName,
      amount: body?.amount ?? body?.value,
    });

    // Retorna erro caso os dados sejam inválidos
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, amount } = parsed.data;

    // Verifica se já existe um orçamento com o mesmo nome para o usuário
    const exists = await prisma.budget.findFirst({ where: { userId, name } });
    if (exists) {
      return NextResponse.json(
        { error: "Já existe um orçamento com esse nome" },
        { status: 409 }
      );
    }

    // Cria o orçamento no banco de dados
    const budget = await prisma.budget.create({
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

    // Retorna o orçamento criado
    return NextResponse.json(budget, { status: 201 });
    
  } catch (error) {
    console.error("POST /api/budgets error", error);

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

// Função para listar os orçamentos do usuário
export async function GET() {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // Verifica se o usuário está autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Busca os orçamentos do usuário no banco de dados
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Retorna a lista de orçamentos
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET /api/budgets error", error);

    // Retorna erro genérico
    return NextResponse.json(
      { error: "Erro ao listar orçamentos" },
      { status: 500 }
    );
  }
}

// Configurações dinâmicas e de runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
