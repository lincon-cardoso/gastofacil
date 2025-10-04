import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

type Budget = {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

const fetcher = async (url: string): Promise<Budget[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar orçamentos (${res.status})`
    );
  }
  return res.json();
};

export function useBudgets() {
  const { session, status } = useSessionSWR();
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Budget[]>(
    canFetch ? "/api/budgets" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5_000,
    }
  );

  return {
    budgets: data ?? [],
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
