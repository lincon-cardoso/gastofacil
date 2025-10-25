// Componente de formulário para registro de novos usuários
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Função que calcula a força da senha baseada em critérios de segurança
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 1; // Pelo menos 8 caracteres
  if (/[A-Z]/.test(password)) strength += 1; // Contém letra maiúscula
  if (/[a-z]/.test(password)) strength += 1; // Contém letra minúscula
  if (/[0-9]/.test(password)) strength += 1; // Contém número
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Contém caractere especial
  return strength; // Retorna valor de 0 a 5
};

const RegisterForm = () => {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER", // Define o papel padrão como USER
  });

  // Estado para armazenar erros de validação
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estado para exibir a força da senha (0-5)
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Estado para controlar a exibição do popup de sucesso
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Hook para navegação entre páginas
  const router = useRouter();

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value })); // Atualiza o campo específico

    // Se o campo alterado for a senha, recalcula a força
    if (id === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    setErrors({}); // Limpa os erros antes de enviar

    try {
      // Envia os dados para a API de registro
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "USER" }), // Garante que o papel seja USER
      });

      if (!response.ok) {
        // Se houver erro, exibe as mensagens de validação
        const data = await response.json();
        if (data.errors) {
          setErrors(data.errors);
        }
      } else {
        // Em caso de sucesso, exibe popup e redireciona
        setShowSuccessPopup(true);
        setTimeout(() => {
          router.push("/login"); // Redireciona para a tela de login
        }, 2000); // Aguarda 2 segundos antes de redirecionar
      }
    } catch (error) {
      // Trata erros de rede ou outros erros inesperados
      console.error("Erro ao enviar o formulário", error);
      setErrors({ general: "Erro ao processar o registro." });
    }
  };

  return (
    <>
      {/* Popup de sucesso que aparece após registro bem-sucedido */}
      {showSuccessPopup && (
        <div className="popup">
          <p>Cadastro realizado com sucesso!</p>
        </div>
      )}

      {/* Formulário de registro */}
      <form onSubmit={handleSubmit}>
        {/* Campo Nome */}
        <div>
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        {/* Campo E-mail */}
        <div>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        {/* Campo Senha com indicador de força */}
        <div>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          {/* Barra de progresso mostrando força da senha */}
          <div>
            <progress max="5" value={passwordStrength}></progress>
            <span>Força da senha: {passwordStrength}/5</span>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        {/* Campo Confirmação de Senha */}
        <div>
          <label htmlFor="confirmPassword">Confirme a Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Botão de submissão */}
        <button type="submit">Registrar</button>
        {/* Exibe erros gerais */}
        {errors.general && <p className="error">{errors.general}</p>}
      </form>

      {/* Estilos CSS-in-JS para o popup */}
      <style jsx>{`
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          text-align: center;
        }
      `}</style>
    </>
  );
};

export default RegisterForm;
