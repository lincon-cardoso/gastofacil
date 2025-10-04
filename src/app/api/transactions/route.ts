import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { createTransactionSchema } from "@/schemas/transaction";
import { extractUserId } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // verifica se o usuario esta autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // le e valida os dados do corpo da requisição
    const body = await request.json().catch((error) => {
      console.error("Erro ao analisar JSON do corpo da requisição:", error);
      return {};
    });

    const parsed = createTransactionSchema.safeParse({
      description: body?.description,
      amount: body?.amount,
      budgetId: body?.budgetId,
      categoryId: body?.categoryId,
      date: body?.date,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { description, amount, budgetId, categoryId, date } = parsed.data;

    // Verificar se o orçamento pertence ao usuário
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Verificar se a categoria pertence ao usuário (se fornecida)
    if (categoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: { id: categoryId, userId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Categoria não encontrada ou não pertence ao usuário" },
          { status: 404 }
        );
      }
    }

    // Criar a transação
    const newTransaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        budgetId,
        categoryId: categoryId || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        category: true,
        budget: true,
      },
    });

    // retorna a nova transação criada com mensagem e status HTTP 201
    return NextResponse.json(
      {
        message: "Transação criada com sucesso!",
        transaction: newTransaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar transação", error);
    return NextResponse.json(
      {
        error: "Erro ao criar nova transação",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // verifica se o usuario esta autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // busca as transações do usuario através dos orçamentos
    const transactions = await prisma.transaction.findMany({
      where: {
        budget: {
          userId,
        },
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        budget: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // retorna as transações encontradas
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar transações",
      },
      { status: 500 }
    );
  }
}
