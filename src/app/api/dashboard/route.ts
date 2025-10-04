import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { extractUserId } from "@/utils/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // Verifica se o usuário está autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Busca todas as informações em paralelo para melhor performance
    const [budget, transactions] = await Promise.all([
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
    ]);

    const totalReceita = budget.reduce((sum, b) => sum + Number(b.amount), 0);
    // somar todas as transacoes do usuario

    const totalTransacoes = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
   
    //  Soma total Receita menos despesa
    const saldoAtual = totalReceita - totalTransacoes;
   
    return NextResponse.json({
      totalReceita,
      totalTransacoes,
      saldoAtual,
    });
  } catch (error) {
    console.error("Erro ao obter dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
