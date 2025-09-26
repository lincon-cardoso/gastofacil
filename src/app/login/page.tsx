import Link from "next/link";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { redirect } from "next/navigation";
import LoginForm from "./components/LoginForm";
import styles from "@/app/login/login.module.scss";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <main>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>
            <div className={styles.lockIcon}>🔒</div>
            Entrar
          </h1>
          <p className={styles.subtitle}>
            Acesse sua conta para gerenciar seus gastos.
          </p>
          <LoginForm />
          <p className={styles.registerLink}>
            Não tem conta? <a href="/register">Crie agora</a>
          </p>
          <Link href="/" className={styles.backButton}>
            Voltar para a página inicial
          </Link>
          <footer className={styles.footer}>
            <p>
              Protegido por criptografia. Ao continuar você concorda com nossa{" "}
              <a href="/privacy">Política de Privacidade</a> e{" "}
              <a href="/terms">Termos de Uso</a>.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
