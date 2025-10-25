// Esquemas de validação para metas financeiras usando Zod
import { z } from "zod";

// Esquema de validação para criação de metas financeiras
// Metas são objetivos de economia que o usuário deseja alcançar
export const createGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório") // Nome da meta é obrigatório
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  targetAmount: z
    .number()
    .positive("Valor alvo deve ser positivo") // Valor que o usuário quer economizar
    .min(0.01, "Valor alvo deve ser pelo menos R$ 0,01"),
  deadline: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : null)), // Data limite opcional para alcançar a meta
});

// Tipo TypeScript gerado a partir do esquema de validação
export type CreateGoalData = z.infer<typeof createGoalSchema>;
