import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

type Card = {
  id: string;
  name: string;
  limit: number;
  dueDay: number;
};

const fetcher = async (url: string): Promise<Card[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Falha ao carregar cartões (${res.status})`);
  }
  return res.json();
};

export function useCards() {
  const { session, status } = useSessionSWR();
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Card[]>(
    canFetch ? "/api/dashboard?type=cards" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // 5 minutos (cartões mudam pouco)
      dedupingInterval: 5_000,
    }
  );

  return {
    cards: data ?? [],
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
