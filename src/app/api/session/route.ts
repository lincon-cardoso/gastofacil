import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        budgets: {
          include: {
            transactions: true,
          },
        },
        goals: true,
        categories: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar todas as transações do usuário
    const transactions = await prisma.transaction.findMany({
      where: {
        budget: {
          userId: user.id,
        },
      },
      include: {
        category: true,
        budget: true,
      },
    });

    // Processar orçamentos
    const orcamentos = user.budgets.map((budget) => {
      // Calcular total utilizado das transações deste orçamento
      const transacoesDoOrcamento = transactions.filter(
        (t) => t.budgetId === budget.id
      );
      const utilizado = transacoesDoOrcamento.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      return {
        categoria: budget.name,
        utilizado,
        total: budget.amount,
      };
    });

    // Processar metas
    const metas = user.goals.map((goal) => {
      return {
        categoria: goal.name,
        utilizado: goal.currentAmount,
        total: goal.targetAmount,
      };
    });

    const sessionData = {
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
      },
      orcamentos,
      metas,
    };

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Erro ao buscar dados da sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
