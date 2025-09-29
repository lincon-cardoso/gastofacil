import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawName: unknown = body?.name ?? body?.categoryName;
    const description: string | undefined = body?.description ?? undefined;

    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Impedir duplicidade por usuário
    const existing = await prisma.expenseCategory.findFirst({
      where: { userId: session.userId, name: name },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome" },
        { status: 409 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        description,
        userId: session.userId,
      },
      select: { id: true, name: true, description: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error", err);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const categories = await prisma.expenseCategory.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/categories error", err);
    return NextResponse.json(
      { error: "Erro ao listar categorias" },
      { status: 500 }
    );
  }
}
