import { prisma } from "@/utils/prisma";

interface RegisterData {
  email: string;
  passwordHash: string;
  planName?: string;
}

export async function registerUser(data: RegisterData) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash, // Assumindo que já está hashada
      },
    });

    if (data.planName) {
      await tx.plan.create({
        data: {
          name: data.planName,
          price: 0, // Valor padrão para o campo obrigatório
          users: {
            connect: { id: user.id },
          },
        },
      });
    }

    return user;
  });
}
