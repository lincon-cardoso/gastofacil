import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST() {
  try {
    const now = new Date();

    // Buscar todos os usuários com assinatura expirada
    const expiredUsers = await prisma.user.findMany({
      where: {
        subscriptionExpiresAt: {
          lte: now, // Data de expiração menor ou igual a agora
        },
        subscriptionStatus: "ACTIVE",
        planName: {
          not: "Free", // Não processar usuários que já estão no plano gratuito
        },
      },
    });

    console.log(
      `Encontrados ${expiredUsers.length} usuários com assinatura expirada`
    );

    // Reverter cada usuário para o plano gratuito
    const updatedUsers = [];
    for (const user of expiredUsers) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          planName: "Free",
          subscriptionStatus: "EXPIRED",
          subscriptionExpiresAt: null,
          updatedAt: new Date(),
        },
        include: {
          plan: true,
        },
      });
      updatedUsers.push(updatedUser);
    }

    return NextResponse.json({
      success: true,
      processedUsers: updatedUsers.length,
      users: updatedUsers.map((user) => ({
        id: user.id,
        email: user.email,
        previousPlan: expiredUsers.find((u) => u.id === user.id)?.planName,
        newPlan: user.planName,
        expiredAt: expiredUsers.find((u) => u.id === user.id)
          ?.subscriptionExpiresAt,
      })),
      message: `${updatedUsers.length} usuários revertidos para o plano gratuito`,
    });
  } catch (error) {
    console.error("Erro ao processar assinaturas expiradas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar status sem processar
export async function GET() {
  try {
    const now = new Date();

    const expiredUsersCount = await prisma.user.count({
      where: {
        subscriptionExpiresAt: {
          lte: now,
        },
        subscriptionStatus: "ACTIVE",
        planName: {
          not: "Free",
        },
      },
    });

    const soonToExpireCount = await prisma.user.count({
      where: {
        subscriptionExpiresAt: {
          gte: now,
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 dias
        },
        subscriptionStatus: "ACTIVE",
        planName: {
          not: "Free",
        },
      },
    });

    return NextResponse.json({
      expiredUsers: expiredUsersCount,
      soonToExpire: soonToExpireCount,
      checkTime: now,
    });
  } catch (error) {
    console.error("Erro ao verificar assinaturas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
