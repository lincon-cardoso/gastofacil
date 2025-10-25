// Hook para gerenciar orçamentos com informações de uso/gasto
"use client";

import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

// Tipo que define a estrutura de um orçamento com dados de uso
type BudgetWithUsage = {
  id: string;
  name: string;
  amount: number; // Valor total do orçamento
  used: number; // Valor já gasto do orçamento
  createdAt: string;
  updatedAt: string;
};

// Função fetcher que trata erros e retorna dados dos orçamentos com uso
const fetcher = async (url: string): Promise<BudgetWithUsage[]> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar orçamentos com uso (${res.status})`
    );
  }
  return res.json();
};

// Hook que retorna orçamentos com informações de quanto foi gasto
export function useBudgetsWithUsage() {
  const { session, status } = useSessionSWR();
  // Só faz requisição se o usuário estiver autenticado
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<BudgetWithUsage[]>(
    canFetch ? "/api/budgets/with-usage" : null, // Endpoint específico para orçamentos com uso
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 30000, // Atualiza automaticamente a cada 30 segundos (dados de gasto mudam frequentemente)
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    budgets: data ?? [], // Lista de orçamentos com uso ou array vazio
    isLoading, // Estado de carregamento
    error: error as Error | undefined, // Erro tipado
    refresh: mutate, // Função para atualizar manualmente
  };
}
