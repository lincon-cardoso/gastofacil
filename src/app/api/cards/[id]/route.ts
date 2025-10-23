import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { createCardSchema } from "@/schemas/card";
import { extractUserId } from "@/utils/auth";

// PUT - Atualizar cartão
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

    // Verifica se o cartão existe e pertence ao usuário
    const existingCard = await prisma.card.findFirst({
      where: { id, userId },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: "Cartão não encontrado" },
        { status: 404 }
      );
    }

    // Valida os dados
    const body = await req.json().catch(() => ({}));
    const parsed = createCardSchema.safeParse({
      name: body?.name,
      limit: Number(body?.limit),
      dueDay: Number(body?.dueDay),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, limit, dueDay } = parsed.data;

    // Verifica se já existe outro cartão com o mesmo nome
    const duplicateCard = await prisma.card.findFirst({
      where: {
        userId,
        name,
        id: { not: id }, // Exclui o cartão atual da verificação
      },
    });

    if (duplicateCard) {
      return NextResponse.json(
        { error: "Já existe um cartão com esse nome" },
        { status: 409 }
      );
    }

    // Atualiza o cartão
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        name,
        limit,
        dueDay,
      },
      select: {
        id: true,
        name: true,
        limit: true,
        dueDay: true,
      },
    });

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cartão" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir cartão
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

    // Verifica se o cartão existe e pertence ao usuário
    const existingCard = await prisma.card.findFirst({
      where: { id, userId },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: "Cartão não encontrado" },
        { status: 404 }
      );
    }

    // Exclui o cartão
    await prisma.card.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cartão excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cartão:", error);
    return NextResponse.json(
      { error: "Erro ao excluir cartão" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
