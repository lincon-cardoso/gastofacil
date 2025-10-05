"use client";

import { useUserData } from "@/hooks/useUserData";
import { mutate } from "swr";

export function useTransactionMutate() {
  const { refreshDashboard } = useUserData();

  const handleTransactionChange = async () => {
    // Atualiza os dados do dashboard unificado
    await refreshDashboard();

    // Atualiza dados específicos se necessário
    await mutate(
      (key) => typeof key === "string" && key.startsWith("/api/dashboard?type=")
    );
  };

  return { handleTransactionChange };
}
