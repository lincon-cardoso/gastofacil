import { prisma } from "@/utils/prisma";

export async function checkAndUpdateExpiredSubscription(userEmail: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { plan: true },
    });

    if (!user) {
      return null;
    }

    const now = new Date();

    // Verificar se a assinatura expirou
    if (
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt <= now &&
      user.subscriptionStatus === "ACTIVE" &&
      user.planName !== "Free"
    ) {
      console.log(
        `Assinatura expirada para usuário ${userEmail}, revertendo para plano gratuito`
      );

      // Reverter para plano gratuito
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          planName: "Free",
          subscriptionStatus: "EXPIRED",
          subscriptionExpiresAt: null,
          updatedAt: new Date(),
        },
        include: { plan: true },
      });

      return {
        user: updatedUser,
        wasExpired: true,
        message:
          "Sua assinatura expirou. Você foi transferido para o plano gratuito.",
      };
    }

    return {
      user,
      wasExpired: false,
    };
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return null;
  }
}

export async function getSubscriptionStatus(userEmail: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        planName: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
        plan: true,
      },
    });

    if (!user) {
      return null;
    }

    const now = new Date();
    const isExpired =
      user.subscriptionExpiresAt && user.subscriptionExpiresAt <= now;
    const daysUntilExpiration = user.subscriptionExpiresAt
      ? Math.ceil(
          (user.subscriptionExpiresAt.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      planName: user.planName,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
      isExpired,
      daysUntilExpiration,
      isActive: user.subscriptionStatus === "ACTIVE" && !isExpired,
    };
  } catch (error) {
    console.error("Erro ao obter status da assinatura:", error);
    return null;
  }
}
