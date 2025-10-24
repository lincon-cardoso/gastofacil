import { useState } from "react";
import { useMetas } from "./useMetas";

type AddAmountResponse = {
  meta: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
  };
  addedAmount: number;
  message: string;
};

export function useAddAmountToGoal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useMetas();

  const addAmountToGoal = async (
    goalId: string,
    amount: number
  ): Promise<AddAmountResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
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

      // Atualiza a lista de metas
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
    addAmountToGoal,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
