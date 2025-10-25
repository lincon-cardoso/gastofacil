import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { extractUserId } from "@/utils/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Busca orçamentos com suas transações
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        transactions: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcula o valor utilizado para cada orçamento
    const budgetsWithUsage = budgets.map((budget) => {
      const used = budget.transactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
      );

      return {
        id: budget.id,
        name: budget.name,
        amount: Number(budget.amount),
        used: used,
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(budgetsWithUsage);
  } catch (error) {
    console.error("Erro ao buscar orçamentos com uso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
