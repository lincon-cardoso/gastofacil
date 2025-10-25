"use client";

import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

type BudgetWithUsage = {
  id: string;
  name: string;
  amount: number;
  used: number;
  createdAt: string;
  updatedAt: string;
};

const fetcher = async (url: string): Promise<BudgetWithUsage[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar orçamentos com uso (${res.status})`
    );
  }
  return res.json();
};

export function useBudgetsWithUsage() {
  const { session, status } = useSessionSWR();
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<BudgetWithUsage[]>(
    canFetch ? "/api/budgets/with-usage" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // 30 segundos
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
