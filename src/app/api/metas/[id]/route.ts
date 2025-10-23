import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { createGoalSchema } from "@/schemas/goal";
import { extractUserId } from "@/utils/auth";

// PUT - Atualizar meta
export async function PUT(
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
    });

    if (!existingMeta) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Valida os dados
    const body = await req.json().catch(() => ({}));
    const parsed = createGoalSchema.safeParse({
      name: body?.name,
      targetAmount: Number(body?.targetAmount),
      deadline: body?.deadline,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, targetAmount, deadline } = parsed.data;

    // Verifica se já existe outra meta com o mesmo nome
    const duplicateMeta = await prisma.goal.findFirst({
      where: {
        userId,
        name,
        id: { not: id }, // Exclui a meta atual da verificação
      },
    });

    if (duplicateMeta) {
      return NextResponse.json(
        { error: "Já existe uma meta com esse nome" },
        { status: 409 }
      );
    }

    // Atualiza a meta
    const updatedMeta = await prisma.goal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        deadline,
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

    return NextResponse.json({ meta: updatedMeta });
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar meta" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir meta
export async function DELETE(
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
    });

    if (!existingMeta) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Exclui a meta
    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Meta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return NextResponse.json(
      { error: "Erro ao excluir meta" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
