import { z } from "zod";
import disposableEmailDomains from "disposable-email-domains";

// Esquema compartilhado de senha (regras fortes)
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(128, "A senha é muito longa")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[@$!%*?&]/, "A senha deve conter pelo menos um caractere especial");

// Esquema completo usado no cliente (inclui confirmação e termos)
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "O nome deve ter pelo menos 2 caracteres")
      .max(255, "O nome é muito longo")
      .trim(),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido")
      .max(255, "E-mail é muito longo")
      .transform((v) => v.trim().toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os termos",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Esquema específico para a API (não exige campos que o cliente não envia)
const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(255, "O nome é muito longo")
    .trim(),
  email: z
    .string()
    .email("E-mail inválido")
    .max(255, "E-mail é muito longo")
    .transform((v) => v.trim().toLowerCase()),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z
    .string()
    .email("E-mail inválido")
    .max(255, "E-mail é muito longo")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof registerSchema>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
  general?: string; // Erros gerais
}

export { registerSchema, registerApiSchema, loginSchema };
export type { FormData, FormErrors };

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split("@")[1];
  return disposableEmailDomains.includes(domain);
};

export const validateEmail = (email: string): boolean => {
  return (
    !isDisposableEmail(email) && z.string().email().safeParse(email).success
  );
};
