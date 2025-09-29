import { z } from "zod";

// Normaliza uma string de valor monetário para número (aceita formatos como "1.234,56" ou "1234.56")
export function normalizeAmount(input: string): number {
  let s = (input ?? "").toString().trim();
  s = s.replace(/[^0-9,.-]/g, "");
  if (s.includes(",")) {
    // formato europeu: 1.234,56 -> 1234.56
    s = s.replace(/\./g, "");
    s = s.replace(/,/g, ".");
  } else {
    // já no formato com ponto decimal ou inteiro
    s = s.replace(/,/g, "");
  }
  return parseFloat(s);
}

export const createBudgetSchema = z
  .object({
    name: z
      .string()
      .max(100, "Nome do orçamento é muito longo")
      .transform((v) => v.trim())
      .refine((v) => v.length > 0, {
        message: "Informe um nome para o orçamento.",
      }),
    amount: z.preprocess(
      (val) => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const n = normalizeAmount(val);
          return Number.isNaN(n) ? val : n;
        }
        return val;
      },
      z
        .number()
        .positive({ message: "Informe um valor numérico maior que zero." })
        .lte(1_000_000, { message: "Valor acima do permitido" })
    ),
  })
  .transform((v) => ({ name: v.name, amount: Number(v.amount) }));

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
