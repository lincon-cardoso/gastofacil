import Image from "next/image";
import styles from "@/components/main/testimonials/page.module.scss";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "O GastoFácil me deu clareza do mês a mês. Finalmente parei de estourar o orçamento.",
      name: "Ana Martins",
      role: "Autônoma",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=256&auto=format&fit=crop",
    },
    {
      quote:
        "Relatórios diretos e objetivos. Em uma semana eu já tinha meus custos sob controle.",
      name: "Rafael Duarte",
      role: "Analista",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop",
    },
    {
      quote: "Uso no celular e no notebook sem complicação. Os alertas salvam!",
      name: "Carla Nunes",
      role: "Empreendedora",
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=256&auto=format&fit=crop",
    },
  ];

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <h3 className={styles.title}>O que dizem nossos usuários</h3>
        <p className={styles.subtitle}>
          Avaliação média: ⭐ 4,8/5 com base em mais de 2.000 usuários.
        </p>
        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className={styles.card}>
              <div className={styles.stars}>★★★★★</div>
              <blockquote className={styles.quote}>
                “{testimonial.quote}”
              </blockquote>
              <figcaption className={styles.figcaption}>
                <Image
                  src={testimonial.avatar}
                  alt={`Foto de ${testimonial.name}`}
                  width={40}
                  height={40}
                  className={styles.avatar}
                  priority
                />
                <div>
                  <div className={styles.name}>{testimonial.name}</div>
                  <div className={styles.role}>{testimonial.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
