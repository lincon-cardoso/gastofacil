// Hook para gerenciar categorias de transações do usuário com SWR
import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

// Tipo que define a estrutura de uma categoria
type Category = {
  id: string;
  name: string;
  description?: string | null; // Descrição opcional da categoria
};

// Função fetcher que trata erros e retorna dados das categorias
const fetcher = async (url: string): Promise<Category[]> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar categorias (${res.status})`
    );
  }
  return res.json();
};

// Hook que retorna lista de categorias com cache inteligente
export function useCategories() {
  const { session, status } = useSessionSWR();
  // Só faz requisição se o usuário estiver autenticado
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    canFetch ? "/api/dashboard?type=categories" : null, // Conditional fetching
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 300000, // Atualiza a cada 5 minutos (categorias mudam pouco)
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    categories: data ?? [], // Lista de categorias ou array vazio
    isLoading, // Estado de carregamento
    error: error as Error | undefined, // Erro tipado
    refresh: mutate, // Função para atualizar manualmente
  };
}
