// Esquemas de validação para transações financeiras usando Zod
import { z } from "zod";

// Esquema de validação para criação de transações
// Transações são receitas ou despesas registradas pelo usuário
export const createTransactionSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória") // Descrição da transação é obrigatória
    .max(255, "Descrição muito longa"),
  amount: z.number().refine((val) => val !== 0, "Valor não pode ser zero"), // Valor pode ser positivo (receita) ou negativo (despesa)
  budgetId: z.string().uuid("ID do orçamento inválido"), // ID do orçamento associado (obrigatório)
  categoryId: z.string().uuid("ID da categoria inválido").optional(), // ID da categoria (opcional)
  date: z.string().or(z.date()).optional(), // Data da transação (opcional, padrão: hoje)
});

// Tipo TypeScript gerado a partir do esquema de validação
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
