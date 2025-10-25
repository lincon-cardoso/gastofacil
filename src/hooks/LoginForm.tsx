// Componente de formulário de login com validação e autenticação
"use client";
import React, { useState } from "react";
import styles from "@/app/login/login.module.scss";
import { z } from "zod";
import { useRouter } from "next/navigation";

// Esquema de validação Zod para os dados de login
const loginSchema = z.object({
  email: z.email("E-mail inválido.").nonempty("O campo e-mail é obrigatório."),
  password: z
    .string()
    .nonempty("O campo senha é obrigatório.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export default function LoginForm() {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false, // Opção para manter o usuário logado
  });

  // Estado para armazenar erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para controlar o carregamento durante o envio
  const [isLoading, setIsLoading] = useState(false);

  // Estado para mensagem de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hook para navegação programática
  const router = useRouter();

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // Trata checkboxes de forma diferente
    }));
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    setErrors({}); // Limpa erros anteriores
    setSuccessMessage(null);

    try {
      // Valida os dados do formulário usando Zod
      loginSchema.parse(formData);

      setIsLoading(true);

      // Envia os dados para a API de login
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      // Trata resposta de erro da API
      if (!response.ok) {
        if (result.errors && typeof result.errors === "object") {
          setErrors(result.errors);
        } else if (result.error) {
          setErrors({ general: result.error });
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setSuccessMessage("Login realizado com sucesso!");

      // Redireciona para a página inicial após login bem-sucedido
      router.push("/dashboard");
    } catch (err) {
      // Trata erros de validação do Zod
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = issue.path[0]?.toString() || "general";
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        });
        setErrors(fieldErrors);
      } else {
        // Trata outros erros inesperados
        console.error("Erro inesperado:", err);
        setErrors({ general: "Erro interno do servidor." });
      }
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {errors.general && <p className={styles.error}>{errors.general}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <div className={styles.inputGroup}>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="voce@email.com"
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="********"
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && (
          <span className={styles.error}>{errors.password}</span>
        )}
      </div>

      <div className={styles.options}>
        <label>
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
          />
          Manter conectado
        </label>
        <a href="/forgot-password" className={styles.forgotPassword}>
          Esqueci minha senha
        </a>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? "Carregando..." : "Entrar"}
      </button>
    </form>
  );
}
