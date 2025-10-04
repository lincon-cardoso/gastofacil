import { z } from "zod";

export const createTransactionSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(255, "Descrição muito longa"),
  amount: z.number().refine((val) => val !== 0, "Valor não pode ser zero"),
  budgetId: z.string().uuid("ID do orçamento inválido"),
  categoryId: z.string().uuid("ID da categoria inválido").optional(),
  date: z.string().or(z.date()).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
