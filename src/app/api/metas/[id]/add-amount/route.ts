import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { extractUserId } from "@/utils/auth";
import { z } from "zod";

const addAmountSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo"),
});

// PATCH - Adicionar valor à meta
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await context.params;

    // Verifica se a meta existe e pertence ao usuário
    const existingMeta = await prisma.goal.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        currentAmount: true,
      },
    });

    if (!existingMeta) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Valida os dados
    const body = await req.json().catch(() => ({}));
    const parsed = addAmountSchema.safeParse({
      amount: Number(body?.amount),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valor inválido", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { amount } = parsed.data;

    // Calcula o novo valor atual
    const newCurrentAmount = existingMeta.currentAmount + amount;

    // Verifica se o valor não excede a meta
    if (newCurrentAmount > existingMeta.targetAmount) {
      return NextResponse.json(
        {
          error: `O valor adicionado (R$ ${amount.toFixed(2)}) excederia a meta. Valor máximo permitido: R$ ${(existingMeta.targetAmount - existingMeta.currentAmount).toFixed(2)}`,
          maxAllowed: existingMeta.targetAmount - existingMeta.currentAmount,
        },
        { status: 400 }
      );
    }

    // Atualiza a meta com o novo valor
    const updatedMeta = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
      },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        currentAmount: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      meta: updatedMeta,
      addedAmount: amount,
      message: `R$ ${amount.toFixed(2)} adicionados à meta "${updatedMeta.name}" com sucesso!`,
    });
  } catch (error) {
    console.error("Erro ao adicionar valor à meta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
