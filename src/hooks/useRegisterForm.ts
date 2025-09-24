import { useState } from "react";
import { registerSchema, FormData, FormErrors } from "@/utils/validation";


export const useRegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      registerSchema.parse(formData);
      setErrors({});
      setIsLoading(true);
      setSuccessMessage(null);

      // Simulação de envio de dados
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setSuccessMessage("Conta criada com sucesso!");
    } catch (err) {
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
    formData,
    errors,
    isLoading,
    successMessage,
    handleChange,
    handleSubmit,
  };
};
