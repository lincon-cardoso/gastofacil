// Hook customizado para gerenciar formulário de registro de usuários
import { useState } from "react";
import { registerSchema, FormData, FormErrors } from "@/utils/validation";
import { useRouter } from "next/navigation";

export const useRegisterForm = () => {
  // Define os valores iniciais do formulário
  const initialFormData: FormData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  };

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Estado para armazenar os erros de validação
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado para indicar se a operação está em andamento
  const [isLoading, setIsLoading] = useState(false);

  // Estado para armazenar mensagens de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  // Função para atualizar os dados do formulário ao alterar os campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value, // Trata checkboxes diferentemente
    }));
  };

  // Função que lida com o envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previne comportamento padrão do formulário

    try {
      // Valida os dados do formulário usando Zod
      registerSchema.parse(formData);
      setErrors({});
      setIsLoading(true);
      setSuccessMessage(null);

      // Envia os dados para a API de registro
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      // Trata resposta de erro da API
      if (!response.ok) {
        if (result.errors && typeof result.errors === "object") {
          setErrors(result.errors as FormErrors);
        } else if (result.error) {
          setErrors({ general: result.error });
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      // Redireciona para a página de login após cadastro bem-sucedido
      if (typeof window !== "undefined") {
        router.push("/login");
      }
    } catch (err) {
      // Trata erros de validação do Zod
      if (err instanceof Error && "issues" in err) {
        const fieldErrors: FormErrors = {};
        (
          err as { issues: { path: (keyof FormErrors)[]; message: string }[] }
        ).issues.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Erro inesperado:", err);
      }
    }
  };

  return {
    formData, // Dados atuais do formulário
    errors, // Erros de validação
    isLoading, // Estado de carregamento
    successMessage, // Mensagem de sucesso
    handleChange, // Função para atualizar campos do formulário
    handleSubmit, // Função para enviar formulário
    resetForm: () => {
      // Função para resetar o formulário para valores iniciais
      setFormData(initialFormData);
      setErrors({});
      setSuccessMessage(null);
    },
  };
};
