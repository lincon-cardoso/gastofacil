import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import { prisma } from "@/utils/prisma";
import rateLimit from "@/utils/rateLimit";
import { registerApiSchema } from "@/utils/validation";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    // Rate limit — se excedido retorna resposta imediatamente
    const rl = await rateLimit(request);
    if (rl) return rl;

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

    // Verificar existência (mensagem neutra para não vazar existência)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { errors: { general: "Não foi possível completar o registro." } },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const defaultPlan = await prisma.plan.findUnique({
      where: { name: "Free" },
    });
    if (!defaultPlan) {
      return NextResponse.json(
        { errors: { general: "Plano padrão não configurado." } },
        { status: 500 }
      );
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        planName: defaultPlan.name,
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
    console.error("Erro ao registrar usuário", error);
    return NextResponse.json(
      { errors: { general: "Erro interno do servidor." } },
      { status: 500 }
    );
  }
}
