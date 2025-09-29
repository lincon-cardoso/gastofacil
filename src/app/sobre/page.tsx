"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/footer/page";
import styles from "@/app/sobre/page.module.scss";

export default function Sobre() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.mainContent}>
        <section className={styles.sobreSection}>
          <div className={styles.container}>
            <h1 className={styles.title}>Sobre o projeto</h1>
            <p className={styles.description}>
              O GastoFácil é mais que uma ferramenta: é um aliado no dia a dia.
              Queremos democratizar o acesso ao planejamento financeiro,
              trazendo clareza, segurança e praticidade para todos os perfis —
              do estudante ao empreendedor.
            </p>
            <div className={styles.cards}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Feito para pessoas</h2>
                <p className={styles.cardDescription}>
                  Desenvolvido com foco em empatia e simplicidade, pensando na
                  realidade de quem vive o desafio de organizar suas finanças.
                </p>
              </div>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Educação financeira</h2>
                <p className={styles.cardDescription}>
                  Não é só sobre registrar gastos, mas aprender hábitos
                  melhores, entender padrões e evoluir continuamente.
                </p>
              </div>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Crescimento sustentável</h2>
                <p className={styles.cardDescription}>
                  Construímos um roadmap transparente e ouvimos a comunidade
                  para crescer de forma consistente e responsável.
                </p>
              </div>
            </div>
            <h2 className={styles.subtitle}>Por que somos diferentes</h2>
            <ul className={styles.featuresList}>
              <li>✔ Experiência realmente simples (sem telas poluídas)</li>
              <li>✔ Relatórios focados em ação, não só gráficos bonitos</li>
              <li>✔ Acessibilidade AAA e performance em mobile</li>
              <li>✔ Suporte humano que fala a sua língua</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
