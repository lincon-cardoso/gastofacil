"use client";
import Footer from "@/components/footer/page";
import Headers from "@/components/header/page";
import dynamic from "next/dynamic";
import styles from "@/app/register/page.module.scss";

const RegisterForm = dynamic(() => import("./components/RegisterForm"), {
  ssr: false,
});

export default function RegisterPage() {
  return (
    <>
      <Headers />
      <main className={styles.registerPage}>
        <section className={styles.registerInfo}>
          <h1>Crie sua conta</h1>
          <p>
            Comece a organizar suas finanças hoje. Cadastro rápido, seguro e sem
            cartão.
          </p>
          <ul>
            <li>14 dias grátis no plano Starter</li>
            <li>Cancelamento a qualquer momento</li>
            <li>LGPD • Criptografia • Backups diários</li>
          </ul>
        </section>

        <section className={styles.registerForm}>
          <RegisterForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
