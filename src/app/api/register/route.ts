import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import { prisma } from "@/utils/prisma";
import { registerApiSchema } from "@/utils/validation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { errors: { general: "Configuração do servidor incompleta." } },
        { status: 500 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { errors: { general: "JSON inválido." } },
        { status: 400 }
      );
    }

    const parsed = registerApiSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0]?.toString() || "general";
        // Apenas mantém o primeiro erro por campo para simplicidade
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // Verificar existência (mensagem específica para e-mail já registrado)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { errors: { email: "Este e-mail já está registrado." } },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Em deploy, o seed pode não ter rodado. Garantimos que o plano padrão exista.
    await prisma.plan.upsert({
      where: { name: "Free" },
      update: {},
      create: {
        name: "Free",
        price: 0,
        description: "O essencial para começar bem",
        budgetLimit: 2,
        transactionLimit: 20,
        features: [
          "Dashboard básico",
          "Até 2 carteiras",
          "Orçamentos simples",
          "Relatórios mensais",
        ],
      },
    });

    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        planName: "Free",
        role: "USER",
      },
    });

    return NextResponse.json(
      { message: "Usuário registrado com sucesso!" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((i) => {
        const key = i.path[0]?.toString() || "general";
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }
    const traceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as { randomUUID: () => string }).randomUUID()
        : Math.random().toString(36).slice(2);

    // Ajuda a diagnosticar diferença entre dev/deploy sem vazar detalhes sensíveis.
    console.error("Erro ao registrar usuário", { traceId, error });

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          errors: {
            general: "Falha ao conectar ao banco de dados.",
            traceId,
          },
        },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: unique constraint
      if (error.code === "P2002") {
        return NextResponse.json(
          { errors: { email: "Este e-mail já está registrado." } },
          { status: 400 }
        );
      }

      // P2021: table does not exist | P2022: column does not exist
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          {
            errors: {
              general:
                "Banco de dados não está preparado (migrações pendentes).",
              traceId,
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          errors: {
            general: "Erro de banco de dados.",
            traceId,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { errors: { general: "Erro interno do servidor.", traceId } },
      { status: 500 }
    );
  }
}
