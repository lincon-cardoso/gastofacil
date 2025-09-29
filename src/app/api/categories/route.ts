import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { prisma } from "@/utils/prisma";
import { extractUserId } from "@/utils/auth";
import { createCategorySchema } from "@/schemas/category";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createCategorySchema.safeParse({
      name: body?.name ?? body?.categoryName,
      description: body?.description,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    const existing = await prisma.expenseCategory.findFirst({
      where: { userId, name },
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
        userId,
      },
      select: { id: true, name: true, description: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Categoria com valores duplicados ou conflito de constraint",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const categories = await prisma.expenseCategory.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error", error);

    return NextResponse.json(
      { error: "Erro ao listar categorias" },
      { status: 500 }
    );
  }
}

// Configurações dinâmicas e de runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
