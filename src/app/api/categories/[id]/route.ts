import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { createCategorySchema } from "@/schemas/category";
import { extractUserId } from "@/utils/auth";

// PUT - Atualizar categoria
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

    // Verifica se a categoria existe e pertence ao usuário
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Valida os dados
    const body = await req.json().catch(() => ({}));
    const parsed = createCategorySchema.safeParse({
      name: body?.name,
      description: body?.description,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    // Verifica se já existe outra categoria com o mesmo nome
    const duplicateCategory = await prisma.expenseCategory.findFirst({
      where: {
        userId,
        name,
        id: { not: id }, // Exclui a categoria atual da verificação
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome" },
        { status: 409 }
      );
    }

    // Atualiza a categoria
    const updatedCategory = await prisma.expenseCategory.update({
      where: { id },
      data: {
        name,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir categoria
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

    // Verifica se a categoria existe e pertence ao usuário
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se há transações associadas a esta categoria
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir categoria com transações associadas" },
        { status: 409 }
      );
    }

    // Exclui a categoria
    await prisma.expenseCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
