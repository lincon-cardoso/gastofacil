import { z } from "zod";

export const createGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  targetAmount: z
    .number()
    .positive("Valor alvo deve ser positivo")
    .min(0.01, "Valor alvo deve ser pelo menos R$ 0,01"),
  deadline: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
});

export type CreateGoalData = z.infer<typeof createGoalSchema>;
