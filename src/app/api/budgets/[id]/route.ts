// Importações necessárias para a rota
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { createBudgetSchema } from "@/schemas/budget";
import { extractUserId } from "@/utils/auth";

// Função para atualizar um orçamento específico
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // Verifica se o usuário está autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verifica se o orçamento existe e pertence ao usuário
    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Lê e valida os dados do corpo da requisição
    const body = await req.json().catch(() => ({}));
    const parsed = createBudgetSchema.safeParse({
      name: body?.name ?? body?.budgetName,
      amount: body?.amount ?? body?.value,
    });

    // Retorna erro caso os dados sejam inválidos
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, amount } = parsed.data;

    // Verifica se já existe outro orçamento com o mesmo nome para o usuário
    const nameConflict = await prisma.budget.findFirst({
      where: {
        userId,
        name,
        id: { not: id }, // Exclui o orçamento atual da busca
      },
    });

    if (nameConflict) {
      return NextResponse.json(
        { error: "Já existe um orçamento com esse nome" },
        { status: 409 }
      );
    }

    // Atualiza o orçamento no banco de dados
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        amount,
      },
      select: {
        id: true,
        name: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Retorna o orçamento atualizado
    return NextResponse.json(updatedBudget, { status: 200 });
  } catch (error) {
    console.error("PUT /api/budgets/[id] error", error);

    // Trata erros conhecidos do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Orçamento com valores duplicados ou conflito de constraint",
          },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Orçamento não encontrado" },
          { status: 404 }
        );
      }
    }

    // Retorna erro genérico
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

// Função para excluir um orçamento específico
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // Verifica se o usuário está autenticado
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verifica se o orçamento existe e pertence ao usuário
    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Exclui o orçamento do banco de dados
    await prisma.budget.delete({
      where: { id },
    });

    // Retorna sucesso
    return NextResponse.json(
      { message: "Orçamento excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/budgets/[id] error", error);

    // Trata erros conhecidos do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Orçamento não encontrado" },
          { status: 404 }
        );
      }
    }

    // Retorna erro genérico
    return NextResponse.json(
      { error: "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
}

// Configurações dinâmicas e de runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
