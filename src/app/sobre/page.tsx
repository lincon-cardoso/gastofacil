import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import styles from "@/app/sobre/page.module.scss";

export default function Sobre() {
  return (
    <main>
      <Header />
      <section className={styles.sobreSection}>
        <div className={styles.container}>
          <h1 className={styles.title}>Sobre o GastoFácil</h1>
          <p className={styles.description}>
            O GastoFácil é uma plataforma desenvolvida para ajudar você a
            gerenciar suas finanças de forma simples, eficiente e segura. Nosso
            objetivo é oferecer ferramentas práticas para que você possa
            registrar despesas, acompanhar relatórios e planejar o futuro com
            clareza.
          </p>
          <h2 className={styles.subtitle}>Por que escolher o GastoFácil?</h2>
          <ul className={styles.featuresList}>
            <li>✔ Controle de despesas ilimitado</li>
            <li>✔ Relatórios visuais e detalhados</li>
            <li>✔ Multiplataforma: use no celular e no desktop</li>
            <li>✔ Segurança de dados com criptografia e conformidade GDPR</li>
          </ul>
          <p className={styles.finalNote}>
            Estamos comprometidos em oferecer a melhor experiência para nossos
            usuários, ajudando você a alcançar seus objetivos financeiros.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
