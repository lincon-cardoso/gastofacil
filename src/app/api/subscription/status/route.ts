import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import {
  checkAndUpdateExpiredSubscription,
  getSubscriptionStatus,
} from "@/utils/subscription-checker";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Verificar e atualizar se necessário
    const result = await checkAndUpdateExpiredSubscription(session.user.email);

    if (!result) {
      return NextResponse.json(
        { error: "Erro ao verificar assinatura" },
        { status: 500 }
      );
    }

    // Obter status detalhado
    const status = await getSubscriptionStatus(session.user.email);

    return NextResponse.json({
      success: true,
      user: result.user,
      wasExpired: result.wasExpired,
      message: result.message || null,
      status,
    });
  } catch (error) {
    console.error("Erro ao verificar status da assinatura:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Força verificação de todas as assinaturas expiradas
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/subscription/check-expired`,
      {
        method: "POST",
      }
    );

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao processar assinaturas expiradas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
