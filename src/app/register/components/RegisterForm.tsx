"use client";

import { useState } from "react";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import styles from "../page.module.scss";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { registerSchema } from "@/utils/validation";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
  general?: string;
}

const RegisterForm = () => {
  const {
    formData,
    errors,
    isLoading,
    successMessage,
    handleChange,
    handleSubmit,
  } = useRegisterForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const validateForm = () => {
    const parsed = registerSchema.safeParse(formData);
    if (parsed.success) {
      setValidationErrors({});
      return true;
    }
    const fieldErrors: ValidationErrors = {};
    parsed.error.issues.forEach((i) => {
      const key = i.path[0]?.toString() as keyof ValidationErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = i.message;
    });
    setValidationErrors(fieldErrors);
    return false;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.registerForm}>
      <div className={styles.formHeader}>
        <div className={styles.headerIcon}>
          <Lock size={24} />
        </div>
        <h2>Crie sua conta</h2>
        <p>Comece a organizar suas finanças hoje.</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome</label>
          <div className={styles.inputWithIcon}>
            <User size={20} className={styles.inputIcon} />
            <input
              type="text"
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          {(errors.name || validationErrors.name) && (
            <span className={styles.fieldError}>
              {validationErrors.name || errors.name}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <div className={styles.inputWithIcon}>
            <Mail size={20} className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              placeholder="voce@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {(errors.email || validationErrors.email) && (
            <span className={styles.fieldError}>
              {validationErrors.email || errors.email}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Senha</label>
          <div className={styles.inputWithIcon}>
            <Lock size={20} className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {(errors.password || validationErrors.password) && (
            <span className={styles.fieldError}>
              {validationErrors.password || errors.password}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <div className={styles.inputWithIcon}>
            <Lock size={20} className={styles.inputIcon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Repita a senha"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {(errors.confirmPassword || validationErrors.confirmPassword) && (
            <span className={styles.fieldError}>
              {validationErrors.confirmPassword || errors.confirmPassword}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel} htmlFor="termsAccepted">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            Eu li e aceito os{" "}
            <Link href="/termos">
              termos de uso e a política de privacidade
            </Link>
            .
          </label>
          {(errors.termsAccepted || validationErrors.termsAccepted) && (
            <span className={styles.fieldError}>
              {validationErrors.termsAccepted || errors.termsAccepted}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? "Criando conta..." : "Criar conta grátis"}
        </button>

        {successMessage && (
          <p className={styles.fieldSuccess}>{successMessage}</p>
        )}
      </form>
      <p className={styles.footerText}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </div>
  );
};

export default RegisterForm;
