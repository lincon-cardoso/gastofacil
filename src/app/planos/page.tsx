import Footer from "@/components/footer/page";
import Header from "@/components/header/page";
import styles from "@/app/planos/page.module.scss";

export default function Planos() {
  const planos = [
    {
      nome: "Gratuito",
      preco: "R$ 0",
      descricao: "Ideal para quem está começando a organizar suas finanças.",
      beneficios: [
        "Cadastro de despesas ilimitado",
        "Relatórios básicos",
        "Acesso em múltiplos dispositivos",
      ],
    },
    {
      nome: "Premium",
      preco: "R$ 19,90/mês",
      descricao: "Para quem busca mais controle e funcionalidades avançadas.",
      beneficios: [
        "Tudo do plano Gratuito",
        "Relatórios avançados e gráficos detalhados",
        "Alertas personalizados",
        "Suporte prioritário",
      ],
    },
    {
      nome: "Empresarial",
      preco: "R$ 49,90/mês",
      descricao: "Perfeito para pequenas empresas e equipes.",
      beneficios: [
        "Tudo do plano Premium",
        "Gestão de múltiplos usuários",
        "Exportação de dados em CSV/Excel",
        "Integração com sistemas externos",
      ],
    },
  ];

  return (
    <main>
      <Header />
      <section className={styles.planosSection}>
        <div className={styles.container}>
          <h1 className={styles.title}>Escolha o plano ideal para você</h1>
          <p className={styles.subtitle}>
            Encontre o plano que melhor atende às suas necessidades financeiras.
          </p>
          <div className={styles.grid}>
            {planos.map((plano) => (
              <div key={plano.nome} className={styles.card}>
                <h2 className={styles.planName}>{plano.nome}</h2>
                <p className={styles.price}>{plano.preco}</p>
                <p className={styles.description}>{plano.descricao}</p>
                <ul className={styles.benefits}>
                  {plano.beneficios.map((beneficio, index) => (
                    <li key={index}>{beneficio}</li>
                  ))}
                </ul>
                <button className={styles.ctaButton}>Assinar</button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
