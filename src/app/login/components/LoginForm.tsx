"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye as Eye, FiEyeOff as EyeOff } from "react-icons/fi";

import styles from "../login.module.scss";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setErrorMsg("Credenciais inválidas. Tente novamente.");
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMsg("Credenciais inválidas."); // Mensagem genérica
        return;
      }

      // obter informacoes de usuario

      const userResponse = await fetch("/api/auth/session");
      const userData = await userResponse.json();

      if (userData?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrorMsg("Ocorreu um erro ao tentar entrar. Tente novamente.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu email"
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Senha</label>
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Mostrar ou esconder senha"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div className={styles.options}>
        <label>
          <input
            type="checkbox"
            name="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Lembrar-me
        </label>
        <a href="/forgot-password" className={styles.forgotPassword}>
          Esqueceu a senha?
        </a>
      </div>
      <button type="submit" className={styles.submitButton}>
        Entrar
      </button>
      {errorMsg && <p className={styles.errorMessage}>{errorMsg}</p>}
    </form>
  );
}
