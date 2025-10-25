// Esquemas de validação para categorias de transações usando Zod
import { z } from "zod";

// Esquema de validação para criação de categorias
// Categorias são usadas para classificar transações (ex: Alimentação, Transporte, etc.)
export const createCategorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"), // Nome da categoria é obrigatório
  description: z.string().optional(), // Descrição opcional da categoria
});
