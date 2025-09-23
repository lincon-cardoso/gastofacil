"use client";
import { useState } from "react";
import styles from "@/app/planos/page.module.scss";
import Footer from "@/components/footer/page";
import Headers from "@/components/header/page";

export default function PlanosPage() {
  const [activePlan, setActivePlan] = useState("Anual");
  const [price, setPrice] = useState({ mensal: 19, anual: 190 }); // Preços base
  const discount = 0.15; // 15% de desconto no plano anual

  const handlePlanChange = (plan: string) => {
    setActivePlan(plan);
    if (plan === "Anual") {
      setPrice((prev) => ({
        ...prev,
        anual: Math.round(prev.mensal * 12 * (1 - discount)),
      }));
    }
  };
  return (
    <main>
      <Headers />
      <div className={styles.container}>
        <h1 className={styles.title}>Planos simples para qualquer fase</h1>
        <p className={styles.description}>
          Comece grátis e evolua quando precisar. Sem cartão de crédito no teste
          e cancelamento a qualquer momento.
        </p>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${
              activePlan === "Mensal" ? styles.annual : ""
            }`}
            onClick={() => handlePlanChange("Mensal")}
          >
            Mensal
          </button>
          <button
            className={`${styles.option} ${
              activePlan === "Anual" ? styles.annual : ""
            }`}
            onClick={() => handlePlanChange("Anual")}
          >
            Anual <span className={styles.discount}>(-15%)</span>
          </button>
        </div>
        <p className={styles.note}>Economize ~15% no anual. Preços em BRL.</p>
      </div>
      <div className={styles.plans}>
        <div className={styles.plan}>
          <h2>Gratuito</h2>
          <p>O essencial para começar bem.</p>
          <ul>
            <li>Dashboard básico</li>
            <li>Até 2 carteiras</li>
            <li>Orçamentos simples</li>
            <li>Relatórios mensais</li>
          </ul>
          <button className={styles.planButton}>Começar agora</button>
        </div>
        <div className={`${styles.plan} ${styles.popular}`}>
          <h2>Pro</h2>
          <p>Para quem quer ir além com automação.</p>
          <p className={styles.price}>
            R$ {activePlan === "Mensal" ? price.mensal : price.anual}{" "}
            {activePlan === "Mensal" ? "/mês" : "/ano"}
          </p>
          <ul>
            <li>Alertas inteligentes</li>
            <li>Categorias ilimitadas</li>
            <li>Exportação CSV/OFX</li>
            <li>Relatórios avançados</li>
            <li>Suporte prioritário</li>
          </ul>
          <button className={styles.planButton}>Assinar Pro</button>
        </div>
        <div className={styles.plan}>
          <h2>Premium</h2>
          <p>Poder máximo para avançados e famílias.</p>
          <p className={styles.price}>
            R$ {activePlan === "Mensal" ? price.mensal * 2 : price.anual * 2}{" "}
            {activePlan === "Mensal" ? "/mês" : "/ano"}
          </p>
          <ul>
            <li>Metas e previsão de fluxo</li>
            <li>Contas compartilhadas</li>
            <li>Anexos de comprovantes</li>
            <li>Integração bancária (Beta)</li>
          </ul>
          <button className={styles.planButton}>Ir de Premium</button>
        </div>
      </div>
      <div className={styles.comparativo}>
        <h2>Comparativo detalhado</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Gratuito</th>
              <th>Pro</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Carteiras</td>
              <td>2</td>
              <td>Ilimitadas</td>
              <td>Ilimitadas</td>
            </tr>
            <tr>
              <td>Categorias</td>
              <td>20</td>
              <td>Ilimitadas</td>
              <td>Ilimitadas</td>
            </tr>
            <tr>
              <td>Alertas</td>
              <td>—</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Exportação CSV/OFX</td>
              <td>—</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Metas & previsão</td>
              <td>—</td>
              <td>—</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Contas compartilhadas</td>
              <td>—</td>
              <td>—</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Anexos de comprovantes</td>
              <td>—</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Integração bancária (Beta)</td>
              <td>—</td>
              <td>—</td>
              <td>✔</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.note}>
          Valores e limites podem variar durante o período Beta.
        </p>
        <div className={styles.infoCards}>
          <div className={styles.card}>
            <div className={styles.icon}>🔒</div>
            <h3>Pagamento seguro</h3>
            <p>
              Processado por provedores certificados. Criptografia
              ponta-a-ponta.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>💳</div>
            <h3>Sem pegadinhas</h3>
            <p>Cancele quando quiser. Sem taxas escondidas.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>⭐</div>
            <h3>Satisfação garantida</h3>
            <p>
              Teste grátis. Reembolso proporcional em até 7 dias conforme lei.
            </p>
          </div>
        </div>
        <div className={styles.faq}>
          <h2>Perguntas frequentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>Posso testar antes de pagar?</h3>
              <p>
                Sim. Você pode começar no plano Gratuito e mudar para
                Pro/Premium quando quiser. Sem cartão de crédito no teste.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>Há desconto no plano anual?</h3>
              <p>
                Sim, aproximadamente 15% em relação ao mensal, exibido já no
                preço do plano anual.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>Posso migrar entre planos?</h3>
              <p>
                Pode, a qualquer momento. O ajuste de cobrança é proporcional.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>Posso cancelar a qualquer momento?</h3>
              <p>
                Sim. O cancelamento é imediato e você mantém o acesso até o fim
                do ciclo vigente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>Meus dados estão seguros?</h3>
              <p>
                Usamos criptografia em trânsito e em repouso e práticas de
                segurança de mercado. Você controla seus dados.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>Quais formas de pagamento são aceitas?</h3>
              <p>
                Cartão de crédito e, em breve, Pix/boleto. Cobranças realizadas
                por provedores certificados.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.startNow}>
        <h2>Pronto para começar?</h2>
        <p>Crie sua conta gratuita agora. Leva menos de 1 minuto.</p>
        <button className={styles.startButton}>Criar conta gratuita</button>
        <p className={styles.securityNote}>
          🔒 SSL, criptografia e conformidade com LGPD.
        </p>
      </div>
      <Footer />
    </main>
  );
}
