import Image from "next/image";
import styles from "@/components/main/features/page.module.scss";

export default function Features() {
  return (
    <section className={styles.featuresSection} data-reveal>
      <div className={styles.featuresContainer}>
        {/* Cabeçalho da seção */}
        <div className={styles.featuresHeader}>
          <h3 className={styles.featuresTitle}>
            Por que escolher o GastoFácil?
          </h3>
          <p className={styles.featuresDescription}>
            Muito mais do que anotar despesas: é sobre ganhar clareza, manter o
            controle e planejar o futuro com segurança.
          </p>
        </div>

        {/* Grid de recursos */}
        <div className={styles.featuresGrid}>
          {[
            {
              img: "/images/budget-categories.jpg",
              title: "Orçamento por categorias",
              desc: "Defina limites para cada área da sua vida e receba alertas antes de estourar.",
            },
            {
              img: "/images/visual-reports.jpg",
              title: "Relatórios visuais",
              desc: "Acompanhe gráficos simples e objetivos para entender seus hábitos.",
            },
            {
              img: "/images/multiplatform.jpg",
              title: "Multiplataforma",
              desc: "Use no computador ou no celular com a mesma experiência.",
            },
          ].map((f, i) => (
            <div key={f.title} className={styles.featureCard} data-reveal>
              {/* Ícone condicional */}
              <div className={styles.featureIcon}>
                {i === 0 && <span className="icon-wallet"></span>}
                {i === 1 && <span className="icon-arrow-right"></span>}
                {i === 2 && <span className="icon-play"></span>}
              </div>

              {/* Imagem do recurso */}
              <Image
                src={f.img}
                alt={f.title}
                className={styles.featureImage}
                width={300}
                height={200}
                loading="lazy"
              />

              {/* Conteúdo do recurso */}
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>{f.title}</h4>
                <p className={styles.featureDescription}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
