"use client";

import { useUserData } from "@/hooks/useUserData";
import { mutate } from "swr";

export function useTransactionMutate() {
  const { refreshDashboard } = useUserData();

  const handleTransactionChange = async () => {
    // Atualiza os dados do dashboard unificado
    await refreshDashboard();

    // Atualiza outros dados relacionados se necessário
    await mutate("/api/transactions");
    await mutate("/api/budgets");
  };

  return { handleTransactionChange };
}
