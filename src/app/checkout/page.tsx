"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./checkout.module.scss";
import Header from "@/components/Header/Header";
import Footer from "@/components/footer/page";
import LoadingSpinner from "./components/LoadingSpinner";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";

interface CheckoutData {
  plan: "pro" | "premium";
  planName: string;
  valor: number;
  periodo: string;
  originalPeriod: "Mensal" | "Anual";
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { isProcessing, error, success, processPayment, resetState } =
    usePaymentProcessor();

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerData, setCustomerData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    const validateAndSetCheckoutData = async () => {
      // Recuperar dados do plano do sessionStorage
      const storedPlanData = sessionStorage.getItem("selectedPlan");

      if (storedPlanData) {
        try {
          const planData = JSON.parse(storedPlanData);

          // Verificar se os dados não são muito antigos (opcional - 1 hora)
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - planData.timestamp > oneHour) {
            sessionStorage.removeItem("selectedPlan");
            // Redirecionar de volta para planos se expirado
            window.location.href = "/planos";
            return;
          }

          // Validar dados do plano no servidor
          const response = await fetch("/api/checkout/validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plan: planData.plan,
              valor: planData.valor,
              periodo: planData.periodo,
              originalPeriod: planData.originalPeriod,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error("Erro na validação do plano:", errorData);
            window.location.href = "/planos";
            return;
          }

          const validationResult = await response.json();

          if (validationResult.valid) {
            setCheckoutData({
              plan: planData.plan,
              planName: planData.planName,
              valor: planData.valor,
              periodo: planData.periodo,
              originalPeriod: planData.originalPeriod,
            });
          } else {
            console.error("Plano inválido");
            window.location.href = "/planos";
          }
        } catch (error) {
          console.error("Erro ao recuperar dados do plano:", error);
          // Redirecionar de volta para planos em caso de erro
          window.location.href = "/planos";
        }
      } else {
        // Fallback: tentar usar searchParams (caso alguém acesse diretamente)
        const plan = searchParams.get("plan") as "pro" | "premium";
        const valor = searchParams.get("valor");
        const periodo = searchParams.get("periodo");

        if (plan && valor && periodo) {
          // Validar também os dados da URL
          const response = await fetch("/api/checkout/validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plan: plan,
              valor: parseFloat(valor),
              periodo: periodo,
              originalPeriod: periodo === "/mês" ? "Mensal" : "Anual",
            }),
          });

          if (response.ok) {
            const validationResult = await response.json();
            if (validationResult.valid) {
              setCheckoutData({
                plan,
                planName: plan === "pro" ? "Pro" : "Premium",
                valor: parseFloat(valor),
                periodo,
                originalPeriod: periodo === "/mês" ? "Mensal" : "Anual",
              });
            } else {
              window.location.href = "/planos";
            }
          } else {
            window.location.href = "/planos";
          }
        }
      }
    };

    validateAndSetCheckoutData();
  }, [searchParams]);

  const handleCustomerDataChange = (field: string, value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCPF = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const formatCardNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})\d+?$/, "$1");
  };

  const formatExpiryDate = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2}\/\d{2})\d+?$/, "$1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkoutData) {
      alert("Erro: Dados do plano não encontrados");
      return;
    }

    // Verificar se os dados do cliente estão preenchidos
    if (
      !customerData.nome ||
      !customerData.email ||
      !customerData.cpf ||
      !customerData.telefone
    ) {
      alert("Por favor, preencha todos os dados pessoais");
      return;
    }

    // Verificar se os dados do cartão estão preenchidos
    if (
      !paymentData.cardNumber ||
      !paymentData.cardName ||
      !paymentData.expiryDate ||
      !paymentData.cvv
    ) {
      alert("Por favor, preencha todos os dados do cartão");
      return;
    }

    // Resetar estado anterior
    resetState();

    try {
      const planName = checkoutData.planName; // "Pro" ou "Premium" - igual ao banco

      // Se não há sessão, significa que é um novo usuário
      // O hook processPayment vai lidar com a criação da conta
      const paymentSuccess = await processPayment(
        planName,
        customerData,
        paymentData,
        checkoutData.valor,
        checkoutData.originalPeriod // Passar o período para o hook
      );

      if (paymentSuccess) {
        // Limpar dados do plano após pagamento bem-sucedido
        sessionStorage.removeItem("selectedPlan");

        if (session?.user) {
          // Usuário já logado - redirecionar para dashboard
          alert(
            "Pagamento processado com sucesso! Redirecionando para o dashboard..."
          );
          window.location.href = "/dashboard";
        } else {
          // Novo usuário - redirecionar para login
          alert(
            "Conta criada e pagamento processado com sucesso! Faça login para acessar sua conta."
          );
          window.location.href = "/login";
        }
      }
    } catch (err) {
      console.error("Erro no processamento:", err);
    }
  };

  const isFormValid = () => {
    const { nome, email, cpf, telefone } = customerData;
    const { cardNumber, cardName, expiryDate, cvv } = paymentData;

    return (
      nome &&
      email &&
      cpf &&
      telefone &&
      cardNumber &&
      cardName &&
      expiryDate &&
      cvv
    );
  };

  if (!checkoutData) {
    return (
      <main>
        <Header />
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            <h1>Erro ao carregar dados do plano</h1>
            <p>
              Os dados do plano não foram encontrados ou expiraram. Por favor,
              selecione um plano novamente.
            </p>
            <p className={styles.securityNote}>
              🔒 Por segurança, os dados do plano são armazenados
              temporariamente e removidos após o uso ou expiração.
            </p>
            <button
              className={styles.backButton}
              onClick={() => (window.location.href = "/planos")}
            >
              Voltar para Planos
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className={styles.container}>
        <div className={styles.checkoutWrapper}>
          {/* Resumo do Plano */}
          <div className={styles.planSummary}>
            <h2>Resumo do Plano</h2>
            <div className={styles.planDetails}>
              <div className={styles.planHeader}>
                <h3>Plano {checkoutData.planName}</h3>
                <span className={styles.planBadge}>
                  {checkoutData.originalPeriod}
                </span>
              </div>

              <div className={styles.priceInfo}>
                <span className={styles.price}>
                  R$ {checkoutData.valor.toFixed(2).replace(".", ",")}
                  <span className={styles.period}>{checkoutData.periodo}</span>
                </span>
              </div>

              <div className={styles.benefits}>
                <h4>Incluído neste plano:</h4>
                <ul>
                  {checkoutData.plan === "pro" && (
                    <>
                      <li>Alertas inteligentes</li>
                      <li>Categorias ilimitadas</li>
                      <li>Exportação CSV/OFX</li>
                      <li>Relatórios avançados</li>
                      <li>Suporte prioritário</li>
                    </>
                  )}
                  {checkoutData.plan === "premium" && (
                    <>
                      <li>Metas e previsão de fluxo</li>
                      <li>Contas compartilhadas</li>
                      <li>Anexos de comprovantes</li>
                      <li>Integração bancária (Beta)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Formulário de Checkout */}
          <div className={styles.checkoutForm}>
            <h2>Finalizar Assinatura</h2>

            <form onSubmit={handleSubmit}>
              {/* Mostrar erro se houver */}
              {error && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <p>{error}</p>
                  <button
                    type="button"
                    className={styles.closeError}
                    onClick={resetState}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Mostrar sucesso se houver */}
              {success && (
                <div className={styles.successAlert}>
                  <span className={styles.successIcon}>✅</span>
                  <p>Pagamento processado com sucesso!</p>
                </div>
              )}

              {/* Dados do Cliente */}
              <div className={styles.section}>
                <h3>Dados Pessoais</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    value={customerData.nome}
                    onChange={(e) =>
                      handleCustomerDataChange("nome", e.target.value)
                    }
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">E-mail *</label>
                  <input
                    type="email"
                    id="email"
                    value={customerData.email}
                    onChange={(e) =>
                      handleCustomerDataChange("email", e.target.value)
                    }
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cpf">CPF *</label>
                    <input
                      type="text"
                      id="cpf"
                      value={customerData.cpf}
                      onChange={(e) =>
                        handleCustomerDataChange(
                          "cpf",
                          formatCPF(e.target.value)
                        )
                      }
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefone">Telefone *</label>
                    <input
                      type="text"
                      id="telefone"
                      value={customerData.telefone}
                      onChange={(e) =>
                        handleCustomerDataChange(
                          "telefone",
                          formatPhone(e.target.value)
                        )
                      }
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Pagamento */}
              <div className={styles.section}>
                <h3>Dados do Cartão</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="cardNumber">Número do Cartão *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      handlePaymentDataChange(
                        "cardNumber",
                        formatCardNumber(e.target.value)
                      )
                    }
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="cardName">Nome no Cartão *</label>
                  <input
                    type="text"
                    id="cardName"
                    value={paymentData.cardName}
                    onChange={(e) =>
                      handlePaymentDataChange(
                        "cardName",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="NOME COMO NO CARTÃO"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="expiryDate">Validade *</label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={(e) =>
                        handlePaymentDataChange(
                          "expiryDate",
                          formatExpiryDate(e.target.value)
                        )
                      }
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      value={paymentData.cvv}
                      onChange={(e) =>
                        handlePaymentDataChange(
                          "cvv",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => (window.location.href = "/planos")}
                  disabled={isProcessing}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!isFormValid() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="small" color="#fff" />
                      <span style={{ marginLeft: "0.5rem" }}>
                        Processando...
                      </span>
                    </>
                  ) : (
                    `Pagar R$ ${checkoutData.valor.toFixed(2).replace(".", ",")}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className={styles.securityInfo}>
          <div className={styles.securityItem}>
            <span className={styles.securityIcon}>🔒</span>
            <div>
              <h4>Pagamento Seguro</h4>
              <p>Seus dados são protegidos com criptografia SSL de 256 bits</p>
            </div>
          </div>

          <div className={styles.securityItem}>
            <span className={styles.securityIcon}>💳</span>
            <div>
              <h4>Sem Compromisso</h4>
              <p>Cancele a qualquer momento sem taxa de cancelamento</p>
            </div>
          </div>

          <div className={styles.securityItem}>
            <span className={styles.securityIcon}>⚡</span>
            <div>
              <h4>Ativação Imediata</h4>
              <p>Acesso liberado imediatamente após a confirmação</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
