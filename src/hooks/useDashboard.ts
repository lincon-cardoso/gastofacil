// Hook para gerenciar dados principais do dashboard com SWR
import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

// Tipo que define a estrutura dos dados do dashboard
type DashboardData = {
  totalReceita: number; // Total de receitas
  totalTransacoes: number; // Total de transações (gastos)
  saldoAtual: number; // Saldo atual (receitas - gastos)
  totalOrcamentoCartao: number; // Total de orçamentos em cartões
};

// Função fetcher que trata erros e retorna dados do dashboard
const fetcher = async (url: string): Promise<DashboardData> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar dados do dashboard (${res.status})`
    );
  }
  return res.json();
};

// Hook que retorna dados principais do dashboard com cache inteligente
export function useDashboard() {
  const { session, status } = useSessionSWR();
  // Só faz requisição se o usuário estiver autenticado
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    canFetch ? "/api/dashboard" : null, // Conditional fetching
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 30000, // Atualiza automaticamente a cada 30 segundos (dados importantes)
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    // Retorna dados do dashboard com valores padrão se não houver dados
    dashboardData: data ?? {
      totalReceita: 0,
      totalTransacoes: 0,
      saldoAtual: 0,
      totalOrcamentoCartao: 0,
    },
    isLoading, // Estado de carregamento
    error: error as Error | undefined, // Erro tipado
    refresh: mutate, // Função para atualizar manualmente
  };
}
