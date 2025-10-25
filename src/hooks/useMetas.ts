// Hook para gerenciar metas financeiras do usuário com SWR
import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

// Tipo que define a estrutura de uma meta financeira
type Meta = {
  id: string;
  name: string;
  targetAmount: number; // Valor alvo da meta
  currentAmount: number; // Valor atual acumulado na meta
  deadline: string | null; // Data limite para alcançar a meta (opcional)
  createdAt: string;
  updatedAt: string;
};

// Função fetcher que trata erros e retorna dados das metas
const fetcher = async (url: string): Promise<Meta[]> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Falha ao carregar metas (${res.status})`);
  }
  return res.json();
};

// Hook que retorna lista de metas com cache inteligente
export function useMetas() {
  const { session, status } = useSessionSWR();
  // Só faz requisição se o usuário estiver autenticado
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Meta[]>(
    canFetch ? "/api/dashboard?type=metas" : null, // Conditional fetching
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 120000, // Atualiza automaticamente a cada 2 minutos
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    metas: data ?? [], // Lista de metas ou array vazio
    isLoading, // Estado de carregamento
    error: error as Error | undefined, // Erro tipado
    refresh: mutate, // Função para atualizar manualmente
  };
}
