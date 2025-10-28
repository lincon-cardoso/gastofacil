"use client";
import { useState } from "react";
import styles from "@/app/planos/page.module.scss";
import Footer from "@/components/footer/page";
import Header from "@/components/Header/Header";
import BaseModal from "@/app/(protect)/dashboard/components/header/modals/BaseModal";

export default function PlanosPage() {
  // Estado centralizado
  const [planState, setPlanState] = useState({
    selectedPeriod: "Anual" as "Mensal" | "Anual",
    prices: {
      pro: {
        mensal: 19,
        anual: 190,
      },
      premium: {
        mensal: 38,
        anual: 380,
      },
    },
  });

  // Estado do modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedPlan: null as {
      type: "gratuito" | "pro" | "premium";
      name: string;
      price: number;
      period: string;
    } | null,
  });

  const handlePlanChange = (period: "Mensal" | "Anual") => {
    setPlanState((prev) => ({
      ...prev,
      selectedPeriod: period,
    }));
  };

  const getCurrentPrice = (planType: "pro" | "premium") => {
    return planState.selectedPeriod === "Mensal"
      ? planState.prices[planType].mensal
      : planState.prices[planType].anual;
  };

  const handlePlanClick = (planType: "gratuito" | "pro" | "premium") => {
    let planDetails;

    if (planType === "gratuito") {
      planDetails = {
        type: planType,
        name: "Gratuito",
        price: 0,
        period: "",
      };
    } else {
      const valor = getCurrentPrice(planType);
      const periodo = planState.selectedPeriod === "Mensal" ? "/mês" : "/ano";
      planDetails = {
        type: planType,
        name: planType === "pro" ? "Pro" : "Premium",
        price: valor,
        period: periodo,
      };
    }

    setModalState({
      isOpen: true,
      selectedPlan: planDetails,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      selectedPlan: null,
    });
  };

  const confirmPlan = () => {
    if (modalState.selectedPlan) {
      console.log("Plano confirmado:", modalState.selectedPlan);

      // Lógica de redirecionamento
      if (modalState.selectedPlan.type === "gratuito") {
        // Redirecionar para registro
        window.location.href = "/register";
      } else {
        // Armazenar dados do plano de forma segura no sessionStorage
        const planData = {
          plan: modalState.selectedPlan.type,
          planName: modalState.selectedPlan.name,
          valor: modalState.selectedPlan.price,
          periodo: modalState.selectedPlan.period,
          originalPeriod: planState.selectedPeriod,
          timestamp: Date.now(),
        };

        sessionStorage.setItem("selectedPlan", JSON.stringify(planData));

        // Redirecionar para checkout sem parâmetros na URL
        window.location.href = "/checkout";
      }
    }
    closeModal();
  };

  return (
    <main>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Planos simples para qualquer fase</h1>
        <p className={styles.description}>
          Comece grátis e evolua quando precisar. Sem cartão de crédito no teste
          e cancelamento a qualquer momento.
        </p>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${
              planState.selectedPeriod === "Mensal" ? styles.annual : ""
            }`}
            onClick={() => handlePlanChange("Mensal")}
          >
            Mensal
          </button>
          <button
            className={`${styles.option} ${
              planState.selectedPeriod === "Anual" ? styles.annual : ""
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
          <button
            className={styles.planButton}
            onClick={() => handlePlanClick("gratuito")}
          >
            Começar agora
          </button>
        </div>
        <div className={`${styles.plan} ${styles.popular}`}>
          <h2>Pro</h2>
          <p>Para quem quer ir além com automação.</p>
          <p className={styles.price}>
            R$ {getCurrentPrice("pro")}{" "}
            {planState.selectedPeriod === "Mensal" ? "/mês" : "/ano"}
          </p>
          <ul>
            <li>Alertas inteligentes</li>
            <li>Categorias ilimitadas</li>
            <li>Exportação CSV/OFX</li>
            <li>Relatórios avançados</li>
            <li>Suporte prioritário</li>
          </ul>
          <button
            className={styles.planButton}
            onClick={() => handlePlanClick("pro")}
          >
            Assinar Pro
          </button>
        </div>
        <div className={styles.plan}>
          <h2>Premium</h2>
          <p>Poder máximo para avançados e famílias.</p>
          <p className={styles.price}>
            R$ {getCurrentPrice("premium")}{" "}
            {planState.selectedPeriod === "Mensal" ? "/mês" : "/ano"}
          </p>
          <ul>
            <li>Metas e previsão de fluxo</li>
            <li>Contas compartilhadas</li>
            <li>Anexos de comprovantes</li>
            <li>Integração bancária (Beta)</li>
          </ul>
          <button
            className={styles.planButton}
            onClick={() => handlePlanClick("premium")}
          >
            Ir de Premium
          </button>
        </div>
      </div>
      {/* ...existing code... */}
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
        <button
          className={styles.startButton}
          onClick={() => handlePlanClick("gratuito")}
        >
          Criar conta gratuita
        </button>
        <p className={styles.securityNote}>
          🔒 SSL, criptografia e conformidade com LGPD.
        </p>
      </div>

      {/* Modal de confirmação do plano */}
      <BaseModal
        open={modalState.isOpen}
        onClose={closeModal}
        title="Confirmação do Plano"
        ariaLabelledBy="plano-modal-title"
        ariaDescribedBy="plano-modal-description"
      >
        <div className={styles.modalBody}>
          {modalState.selectedPlan && (
            <>
              <h3 id="plano-modal-description">
                Plano Selecionado: {modalState.selectedPlan.name}
              </h3>
              {modalState.selectedPlan.price > 0 ? (
                <p className={styles.modalPrice}>
                  Valor: R$ {modalState.selectedPlan.price}
                  {modalState.selectedPlan.period}
                </p>
              ) : (
                <p className={styles.modalPrice}>Plano Gratuito</p>
              )}

              <div className={styles.planBenefits}>
                <h4>O que está incluso:</h4>
                <ul>
                  {modalState.selectedPlan.type === "gratuito" && (
                    <>
                      <li>Dashboard básico</li>
                      <li>Até 2 carteiras</li>
                      <li>Orçamentos simples</li>
                      <li>Relatórios mensais</li>
                    </>
                  )}
                  {modalState.selectedPlan.type === "pro" && (
                    <>
                      <li>Alertas inteligentes</li>
                      <li>Categorias ilimitadas</li>
                      <li>Exportação CSV/OFX</li>
                      <li>Relatórios avançados</li>
                      <li>Suporte prioritário</li>
                    </>
                  )}
                  {modalState.selectedPlan.type === "premium" && (
                    <>
                      <li>Metas e previsão de fluxo</li>
                      <li>Contas compartilhadas</li>
                      <li>Anexos de comprovantes</li>
                      <li>Integração bancária (Beta)</li>
                    </>
                  )}
                </ul>
              </div>

              <p>Confirma a seleção deste plano?</p>
            </>
          )}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={closeModal}>
            Cancelar
          </button>
          <button className={styles.confirmButton} onClick={confirmPlan}>
            {modalState.selectedPlan?.price && modalState.selectedPlan.price > 0
              ? "Prosseguir para Pagamento"
              : "Criar Conta Gratuita"}
          </button>
        </div>
      </BaseModal>

      <Footer />
    </main>
  );
}
