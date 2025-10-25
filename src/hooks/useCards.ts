// Hook para gerenciar cartões de crédito do usuário com SWR
import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

// Tipo que define a estrutura de um cartão de crédito
type Card = {
  id: string;
  name: string;
  limit: number; // Limite de crédito
  dueDay: number; // Dia de vencimento da fatura
};

// Função fetcher que trata erros e retorna dados dos cartões
const fetcher = async (url: string): Promise<Card[]> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Falha ao carregar cartões (${res.status})`);
  }
  return res.json();
};

// Hook que retorna lista de cartões com cache inteligente
export function useCards() {
  const { session, status } = useSessionSWR();
  // Só faz requisição se o usuário estiver autenticado
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Card[]>(
    canFetch ? "/api/dashboard?type=cards" : null, // Conditional fetching
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 300000, // Atualiza a cada 5 minutos (cartões mudam menos)
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    cards: data ?? [], // Lista de cartões ou array vazio
    isLoading, // Estado de carregamento
    error: error as Error | undefined, // Erro tipado
    refresh: mutate, // Função para atualizar manualmente
  };
}
