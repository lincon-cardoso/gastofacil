"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

// Fetcher simples para SWR
const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar sessão");
  return (await res.json()) as Session | null;
};

// Hook que usa SWR para obter a sessão e revalidar automaticamente
export function useSessionSWR() {
  // Mantém compatibilidade com next-auth para status/loading inicial
  const { status } = useSession();

  const { data, error, isLoading, mutate } = useSWR<Session | null>(
    "/api/auth/session",
    fetcher,
    {
      // Revalida quando a página ganha foco e reconecta rede
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Revalidação periódica (ex.: a cada 20s) para refletir mudanças no banco
      refreshInterval: 20_000,
      // Evita manter em cache por muito tempo
      dedupingInterval: 5_000,
    }
  );

  return {
    session: data ?? null,
    status,
    isLoading,
    isError: !!error,
    mutate,
  } as const;
}
