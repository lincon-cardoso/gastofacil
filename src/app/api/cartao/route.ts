// Importações necessárias para a rota
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { Prisma } from "@prisma/client";
import { extractUserId } from "@/utils/auth";
import { z } from "zod";

// Esquema de validação usando Zod para garantir que os dados recebidos sejam válidos
type CardData = {
  cardName: string;
  cardNumber?: number | null; // Agora é um número
  limit: number;
  dueDay: number;
};

// Ajuste no esquema de validação
// Validação mais rigorosa para número de cartão

const cardSchema = z.object({
  cardName: z
    .string()
    .min(1, { message: "O nome do cartão é obrigatório" })
    .regex(/^(?!\d+$).*/, {
      message: "O nome do cartão não pode conter apenas números",
    }),

  cardNumber: z
    .number()
    .int({ message: "O número do cartão deve ser um número inteiro" })
    .min(1000000000000, {
      message: "O número do cartão deve ter pelo menos 13 dígitos",
    })
    .max(9999999999999999999, {
      message: "O número do cartão deve ter no máximo 19 dígitos",
    })
    .optional()
    .nullable(),

  limit: z
    .number()
    .positive({
      message: "O limite deve ser um número positivo maior que zero",
    })
    .finite({ message: "O limite deve ser um número finito" })
    .refine((val) => val !== undefined, { message: "O limite é obrigatório" }),

  dueDay: z
    .number()
    .int({ message: "O dia de vencimento deve ser um número inteiro" })
    .min(1, { message: "O dia de vencimento deve ser no mínimo 1" })
    .max(31, { message: "O dia de vencimento deve ser no máximo 31" }),
});
// Função que cria um novo cartão
export async function POST(req: Request) {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await getServerSession(authOptions);
    const userId = extractUserId(session);

    // Verifica se o usuário está autenticado
    if (!userId) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Extrai e valida os dados do corpo da requisição
    const body = await req.json();
    const parsedData = cardSchema.safeParse(body);

    // Adição de códigos de erro nas validações

    // Verifica se os dados são válidos
    if (!parsedData.success) {
      const validationErrors = parsedData.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: "VALIDATION_ERROR",
      }));

      return NextResponse.json(
        {
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Desestrutura os dados validados
    const { cardName, cardNumber, limit, dueDay }: CardData = parsedData.data;

    // Verifica se já existe um cartão com o mesmo nome para o usuário

    const existingCard = await prisma.card.findFirst({
      where: {
        userId: userId,
        OR: [
          { name: cardName },
          { number: cardNumber != null ? String(cardNumber) : undefined },
        ],
      },
    });

    if (existingCard) {
      return NextResponse.json(
        {
          error: "Já existe um cartão com este nome ou número",
        },
        { status: 400 }
      );
    }

    // Cria o cartão no banco de dados
    const newCard = await prisma.card.create({
      data: {
        name: cardName, // Nome do cartão
        number: cardNumber != null ? String(cardNumber) : "", // Garante que seja null em vez de undefined
        limit, // Limite do cartão
        dueDay: Number(dueDay), // Converte dueDay para número, caso seja string
        userId: userId, // Relaciona o cartão ao usuário autenticado
      },
    });

    // Retorna o cartão criado (omitindo informações sensíveis)
    return NextResponse.json(
      {
        id: newCard.id, // ID do cartão
        name: newCard.name, // Nome do cartão
        limit: newCard.limit, // Limite do cartão
        dueDay: newCard.dueDay, // Dia de vencimento do cartão
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar cartao:", error);

    // Trata erros conhecidos do Prisma, como violação de unicidade
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ja existe um cartao com esse nome" },
          { status: 409 }
        );
      }
    }

    // Trata outros erros de forma genérica
    return NextResponse.json(
      {
        error:
          "Erro interno do servidor. Por favor, tente novamente mais tarde.",
      },
      { status: 500 }
    );
  }
}
