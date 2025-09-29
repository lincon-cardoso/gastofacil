import useSWR from "swr";
import { useSessionSWR } from "@/hooks/useSessionSWR";

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

const fetcher = async (url: string): Promise<Category[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || `Falha ao carregar categorias (${res.status})`
    );
  }
  return res.json();
};

export function useCategories() {
  const { session, status } = useSessionSWR();
  const canFetch = !!session?.userId && status !== "loading";
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    canFetch ? "/api/categories" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5_000,
    }
  );
  return {
    categories: data ?? [],
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
