// Esquemas de validação para orçamentos usando Zod
import { z } from "zod";

// Função utilitária para normalizar valores monetários em diferentes formatos
// Converte formatos como "1.234,56" (europeu) ou "1234.56" (americano) para número
export function normalizeAmount(input: string): number {
  let s = (input ?? "").toString().trim();
  s = s.replace(/[^0-9,.-]/g, ""); // Remove caracteres não numéricos
  if (s.includes(",")) {
    // formato europeu: 1.234,56 -> 1234.56
    s = s.replace(/\./g, ""); // Remove pontos (separadores de milhares)
    s = s.replace(/,/g, "."); // Substitui vírgula por ponto decimal
  } else {
    // já no formato com ponto decimal ou inteiro
    s = s.replace(/,/g, ""); // Remove vírgulas desnecessárias
  }
  return parseFloat(s);
}

// Esquema de validação para criação de orçamentos
export const createBudgetSchema = z
  .object({
    name: z
      .string()
      .max(100, "Nome do orçamento é muito longo")
      .transform((v) => v.trim()) // Remove espaços em branco
      .refine((v) => v.length > 0, {
        message: "Informe um nome para o orçamento.",
      }),
    amount: z.preprocess(
      (val) => {
        // Pré-processa o valor para aceitar strings e números
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const n = normalizeAmount(val); // Normaliza formato monetário
          return Number.isNaN(n) ? val : n;
        }
        return val;
      },
      z
        .number()
        .positive({ message: "Informe um valor numérico maior que zero." })
        .lte(1_000_000, { message: "Valor acima do permitido" }) // Limite máximo de 1 milhão
    ),
  })
  .transform((v) => ({ name: v.name, amount: Number(v.amount) })); // Garante que amount é um número

// Tipo TypeScript gerado a partir do esquema de validação
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
