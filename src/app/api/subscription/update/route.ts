import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { planName, paymentData, userData, period } = await request.json();

    // Validar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    let user;
    let isNewUser = false;

    // Calcular data de expiração baseada no período
    const now = new Date();
    const subscriptionExpiresAt = new Date(now);

    if (period === "Anual") {
      subscriptionExpiresAt.setFullYear(now.getFullYear() + 1);
    } else {
      // Mensal por padrão
      subscriptionExpiresAt.setMonth(now.getMonth() + 1);
    }

    if (session?.user?.email) {
      // Usuário autenticado - atualizar plano existente
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          planName: plan.name,
          subscriptionExpiresAt: subscriptionExpiresAt,
          subscriptionStatus: "ACTIVE",
          updatedAt: new Date(),
        },
        include: {
          plan: true,
        },
      });
    } else if (userData?.email) {
      // Usuário não autenticado - criar nova conta
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "E-mail já cadastrado. Faça login para continuar." },
          { status: 409 }
        );
      }

      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          planName: plan.name,
          subscriptionExpiresAt: subscriptionExpiresAt,
          subscriptionStatus: "ACTIVE",
          passwordHash: "", // Usuário criado via pagamento, sem senha inicial
          // Você pode gerar uma senha temporária ou enviar por email
        },
        include: {
          plan: true,
        },
      });
      isNewUser = true;
    } else {
      return NextResponse.json(
        { error: "Dados de usuário não fornecidos" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        planName: user.planName,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        subscriptionStatus: user.subscriptionStatus,
        plan: user.plan,
      },
      isNewUser: isNewUser,
      message: isNewUser
        ? "Conta criada e plano ativado com sucesso"
        : "Plano atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao processar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
