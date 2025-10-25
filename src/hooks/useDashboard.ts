import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

type DashboardData = {
  totalReceita: number;
  totalTransacoes: number;
  saldoAtual: number;
  totalOrcamentoCartao: number;
};

const fetcher = async (url: string): Promise<DashboardData> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Falha ao carregar dados do dashboard (${res.status})`);
  }
  return res.json();
};

export function useDashboard() {
  const { session, status } = useSessionSWR();
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    canFetch ? "/api/dashboard" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // 30 segundos para dados principais
      dedupingInterval: 5_000,
    }
  );

  return {
    dashboardData: data ?? {
      totalReceita: 0,
      totalTransacoes: 0,
      saldoAtual: 0,
      totalOrcamentoCartao: 0,
    },
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}