import { z } from "zod";

export const createCardSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  limit: z.number().min(0, "Limite deve ser positivo").default(0),
  dueDay: z
    .number()
    .min(1, "Dia de fechamento deve ser entre 1 e 31")
    .max(31, "Dia de fechamento deve ser entre 1 e 31")
    .default(1),
});

export type CreateCardData = z.infer<typeof createCardSchema>;
