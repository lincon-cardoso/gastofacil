// Hook para gerenciar orçamentos do usuário com SWR
import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

// Tipo que define a estrutura de um orçamento
type Budget = {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

// Função fetcher que trata erros e retorna dados dos orçamentos
const fetcher = async (url: string): Promise<Budget[]> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar orçamentos (${res.status})`
    );
  }
  return res.json();
};

// Hook que retorna lista de orçamentos com cache inteligente
export function useBudgets() {
  const { session, status } = useSessionSWR();
  // Só faz requisição se o usuário estiver autenticado
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Budget[]>(
    canFetch ? "/api/dashboard?type=budgets" : null, // Conditional fetching
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 60000, // Atualiza automaticamente a cada 1 minuto
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    budgets: data ?? [], // Lista de orçamentos ou array vazio
    isLoading, // Estado de carregamento
    error: error as Error | undefined, // Erro tipado
    refresh: mutate, // Função para atualizar manualmente
  };
}
