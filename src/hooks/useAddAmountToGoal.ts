// Hook para adicionar valores a metas financeiras
import { useState } from "react";
import { useMetas } from "./useMetas";

// Tipo para resposta da API ao adicionar valor à meta
type AddAmountResponse = {
  meta: {
    id: string;
    name: string;
    targetAmount: number; // Valor alvo da meta
    currentAmount: number; // Valor atual acumulado
    deadline: string | null; // Data limite (opcional)
    createdAt: string;
    updatedAt: string;
  };
  addedAmount: number; // Valor que foi adicionado
  message: string; // Mensagem de sucesso
};

// Hook que fornece funcionalidade para adicionar valores às metas
export function useAddAmountToGoal() {
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState<string | null>(null); // Estado de erro
  const { refresh } = useMetas(); // Hook para atualizar lista de metas

  // Função principal para adicionar valor a uma meta específica
  const addAmountToGoal = async (
    goalId: string, // ID da meta
    amount: number // Valor a ser adicionado
  ): Promise<AddAmountResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Envia requisição para adicionar valor à meta
      const response = await fetch(`/api/metas/${goalId}/add-amount`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar valor à meta");
      }

      // Atualiza a lista de metas no cache para refletir a mudança
      await refresh();

      return data as AddAmountResponse;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addAmountToGoal, // Função para adicionar valor à meta
    isLoading, // Estado de carregamento
    error, // Mensagem de erro se houver
    clearError: () => setError(null), // Função para limpar erro
  };
}
