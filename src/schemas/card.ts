// Esquemas de validação para cartões de crédito usando Zod
import { z } from "zod";

// Esquema de validação para criação de cartões de crédito
export const createCardSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório") // Nome do cartão é obrigatório
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  limit: z.number().min(0, "Limite deve ser positivo").default(0), // Limite de crédito (padrão: 0)
  dueDay: z
    .number()
    .min(1, "Dia de fechamento deve ser entre 1 e 31") // Dia do mês para fechamento da fatura
    .max(31, "Dia de fechamento deve ser entre 1 e 31")
    .default(1), // Padrão: dia 1
});

// Tipo TypeScript gerado a partir do esquema de validação
export type CreateCardData = z.infer<typeof createCardSchema>;
