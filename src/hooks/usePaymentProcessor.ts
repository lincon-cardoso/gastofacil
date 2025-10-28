import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

interface CustomerData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

interface PaymentHookResult {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  processPayment: (
    planName: string,
    customerData: CustomerData,
    paymentData: PaymentData,
    amount: number,
    period?: "Mensal" | "Anual"
  ) => Promise<boolean>;
  resetState: () => void;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

interface PaymentTransactionData {
  transactionId?: string;
  amount: number;
  customerData: CustomerData;
  timestamp: string;
}

export function usePaymentProcessor(): PaymentHookResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session, update: updateSession } = useSession();

  const simulatePaymentGateway = async (
    paymentData: PaymentData,
    amount: number
  ): Promise<PaymentResult> => {
    // Simular delay do gateway de pagamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simular validações básicas
    if (paymentData.cardNumber.replace(/\s/g, "").length < 16) {
      return { success: false, error: "Número do cartão inválido" };
    }

    if (paymentData.cvv.length < 3) {
      return { success: false, error: "CVV inválido" };
    }

    // Simular verificação de valor
    if (amount <= 0) {
      return { success: false, error: "Valor inválido" };
    }

    // Simular falha ocasional (5% de chance)
    if (Math.random() < 0.05) {
      return { success: false, error: "Transação negada pelo banco emissor" };
    }

    // Simular sucesso
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  };

  const processPayment = useCallback(
    async (
      planName: string,
      customerData: CustomerData,
      paymentData: PaymentData,
      amount: number,
      period: "Mensal" | "Anual" = "Mensal"
    ): Promise<boolean> => {
      setIsProcessing(true);
      setError(null);
      setSuccess(false);

      const updateUserPlan = async (
        planName: string,
        paymentData: PaymentTransactionData,
        userData?: { name: string; email: string }
      ) => {
        const response = await fetch("/api/subscription/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planName,
            paymentData,
            period, // Incluir o período
            userData: session?.user ? undefined : userData, // Só enviar userData se não tiver sessão
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao atualizar plano");
        }

        return response.json();
      };

      try {
        // Etapa 1: Processar pagamento no gateway
        console.log("Processando pagamento...");
        const paymentResult = await simulatePaymentGateway(paymentData, amount);

        if (!paymentResult.success) {
          throw new Error(
            paymentResult.error || "Falha no processamento do pagamento"
          );
        }

        console.log("Pagamento aprovado:", paymentResult.transactionId);

        // Etapa 2: Atualizar/criar usuário e plano no banco
        console.log("Processando dados do usuário...");

        // Preparar dados do usuário para criação de conta (se não estiver logado)
        const userData = !session?.user
          ? {
              name: customerData.nome,
              email: customerData.email,
            }
          : undefined;

        const updateResult = await updateUserPlan(
          planName,
          {
            transactionId: paymentResult.transactionId,
            amount,
            customerData,
            timestamp: new Date().toISOString(),
          },
          userData
        );

        console.log("Plano atualizado:", updateResult);

        // Etapa 3: Atualizar sessão do usuário (se existir)
        if (session?.user && updateSession) {
          await updateSession({
            user: {
              ...session.user,
              planName: updateResult.user.planName,
              plan: updateResult.user.plan,
            },
          });
        }

        setSuccess(true);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        console.error("Erro no processamento:", errorMessage);
        setError(errorMessage);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [session, updateSession]
  );

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isProcessing,
    error,
    success,
    processPayment,
    resetState,
  };
}
