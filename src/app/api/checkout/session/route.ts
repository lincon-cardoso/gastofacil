import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { prisma } from "@/utils/prisma";

interface CheckoutSessionRequest {
  planType: "pro" | "premium";
  period: "Mensal" | "Anual";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { planType, period }: CheckoutSessionRequest = await request.json();

    // Validar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { name: planType },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Calcular o preço baseado no período
    let valor: number;
    let periodoTexto: string;

    if (planType === "pro") {
      valor = period === "Mensal" ? 19 : 190;
      periodoTexto = period === "Mensal" ? "/mês" : "/ano";
    } else if (planType === "premium") {
      valor = period === "Mensal" ? 38 : 380;
      periodoTexto = period === "Mensal" ? "/mês" : "/ano";
    } else {
      return NextResponse.json(
        { error: "Tipo de plano inválido" },
        { status: 400 }
      );
    }

    // Criar sessão de checkout segura
    const checkoutSession = {
      id: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plan: planType,
      planName: planType === "pro" ? "Pro" : "Premium",
      valor: valor,
      periodo: periodoTexto,
      originalPeriod: period,
      userId: session?.user?.email || null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
    };

    // Aqui você poderia salvar a sessão no Redis ou banco de dados
    // Por simplicidade, vamos retornar os dados para o frontend armazenar

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      checkoutData: {
        plan: checkoutSession.plan,
        planName: checkoutSession.planName,
        valor: checkoutSession.valor,
        periodo: checkoutSession.periodo,
        originalPeriod: checkoutSession.originalPeriod,
      },
      message: "Sessão de checkout criada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
