import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { extractUserId } from "@/utils/auth";

// Tipo para dados unificados do dashboard
type DashboardData = {
  totalReceita: number;
  totalTransacoes: number;
  saldoAtual: number;
  totalOrcamentoCartao: number;
  budgets?: Array<{
    id: string;
    name: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  transactions?: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
    category: { id: string; name: string } | null;
    budget: { id: string; name: string };
  }>;
  metas?: Array<{
    id: string;
    name: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Se um tipo específico for solicitado
    switch (type) {
      case "budgets":
        return getBudgets(userId);

      case "categories":
        return getCategories(userId);

      case "transactions":
        return getTransactions(userId);

      case "metas":
        return getMetas(userId);

      default:
        // Retorna dados completos do dashboard
        return getDashboardData(userId);
    }
  } catch (error) {
    console.error("Erro na API dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para dados completos do dashboard
async function getDashboardData(userId: string) {
  try {
    // Busca todas as informações em paralelo para melhor performance
    const [budget, transactions, cards] = await Promise.all([
      // Budgets para total de orçamentos planejados
      prisma.budget.findMany({
        where: { userId },
        select: {
          amount: true,
        },
      }),

      // Transações do usuário (via relacionamento com Budget)
      prisma.transaction.findMany({
        where: {
          budget: {
            userId, // Filtra pelo userId através do relacionamento com Budget
          },
        },
        select: {
          amount: true,
        },
      }),

      // Puxa os dados do card ve nome e limite e dia de fechamento
      prisma.card.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          limit: true,
          dueDay: true,
        },
      })

    ]);

    // Total de orcamento cartao

    const totalOrcamentoCartao = cards.reduce((sum, c) => sum + Number(c.limit), 0);


    const totalReceita = budget.reduce((sum, b) => sum + Number(b.amount), 0);
    // somar todas as transacoes do usuario

    const totalTransacoes = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    //  Soma total Receita menos despesa
    const saldoAtual = totalReceita - totalTransacoes;

    const dashboardData: DashboardData = {
      totalReceita,
      totalTransacoes,
      saldoAtual,
      totalOrcamentoCartao,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
}

// Função para buscar orçamentos
async function getBudgets(userId: string) {
  try {
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

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    throw error;
  }
}

// Função para buscar categorias
async function getCategories(userId: string) {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw error;
  }
}

// Função para buscar transações
async function getTransactions(userId: string) {
  try {
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
      take: 50, // Limita para performance
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    throw error;
  }
}

// Função para buscar metas
async function getMetas(userId: string) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    throw error;
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
