import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

type Meta = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
};

const fetcher = async (url: string): Promise<Meta[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Falha ao carregar metas (${res.status})`);
  }
  return res.json();
};

export function useMetas() {
  const { session, status } = useSessionSWR();
  const canFetch = !!session?.userId && status !== "loading";

  const { data, error, isLoading, mutate } = useSWR<Meta[]>(
    canFetch ? "/api/dashboard?type=metas" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 120000, // 2 minutos
      dedupingInterval: 5_000,
    }
  );

  return {
    metas: data ?? [],
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
