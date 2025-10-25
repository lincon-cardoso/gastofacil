// Hook para invalidar cache quando transações são modificadas
"use client";

import { useUserData } from "@/hooks/useUserData";
import { mutate } from "swr";

// Hook que fornece funcionalidades para atualizar cache após mudanças em transações
export function useTransactionMutate() {
  const { refreshDashboard } = useUserData();

  // Função que invalida todos os caches relacionados a transações
  const handleTransactionChange = async () => {
    // Atualiza os dados do dashboard unificado (saldos, totais, etc.)
    await refreshDashboard();

    // Atualiza dados específicos das transações
    await mutate("/api/dashboard?type=transactions");

    // Atualiza todos os endpoints do dashboard que começam com o padrão
    // Isso inclui orçamentos, categorias, metas, etc.
    await mutate(
      (key) => typeof key === "string" && key.startsWith("/api/dashboard?type=")
    );
  };

  return {
    handleTransactionChange, // Função para ser chamada após criar/editar/deletar transações
  };
}
