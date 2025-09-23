import { FaPlay as Play } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import styles from "@/components/main/heroSection/page.module.scss";

export default function HeroSection() {
  return (
    <section className={styles.heroSection} aria-labelledby="hero-title">
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h2 id="hero-title" className={styles.heroTitle}>
            Controle suas finanças de forma simples e gratuita
          </h2>
          <p className={styles.heroSubtitle}>
            Controle seus gastos e planeje o futuro em minutos.
          </p>
          <p className={styles.heroDescription}>
            O GastoFácil ajuda você a registrar despesas, definir orçamentos e
            acompanhar relatórios em tempo real. Inspirado em soluções como
            Minhas Economias, mas com design moderno e experiência simplificada.
          </p>
          <p className={styles.heroStats}>
            +10 mil usuários ativos confiam no GastoFácil todos os dias.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.btnPrimary}>
              Criar conta gratuita{" "}
              <FiArrowRight className={styles.icon} aria-hidden />
            </button>
            <button className={styles.btnSecondary}>
              <Play className={styles.icon} aria-hidden /> Ver demo
            </button>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <Image
            src="/images/imagen-reuniao.png"
            alt="Imagem de exemplo"
            layout="responsive"
            width={588}
            height={385}
          />
        </div>
      </div>
    </section>
  );
}
