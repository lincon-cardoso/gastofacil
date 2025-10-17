"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";

// Tipo para transação
type Transaction = {
  id: string;
  description: string | null;
  amount: number;
  date: string;
  category: { id: string; name: string } | null;
  budget: { id: string; name: string };
};

// Função fetcher para requisições
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
};

export function useTransactions() {
  const { data: session } = useSession();

  // SWR para buscar transações
  const {
    data: transactions,
    error,
    mutate: refreshTransactions,
    isLoading,
  } = useSWR<Transaction[]>(
    session?.user ? "/api/dashboard?type=transactions" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  return {
    transactions: transactions || [],
    isLoading,
    isError: !!error,
    refreshTransactions,
  };
}
