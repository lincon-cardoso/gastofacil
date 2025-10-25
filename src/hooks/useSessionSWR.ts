// Hook avançado para gerenciar sessão com SWR e NextAuth
"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

// Função fetcher para requisições de sessão
const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache do navegador
  if (!res.ok) throw new Error("Falha ao buscar sessão");
  return (await res.json()) as Session | null;
};

// Hook que combina NextAuth com SWR para sessão com revalidação automática
export function useSessionSWR() {
  // Mantém compatibilidade com next-auth para status inicial
  const { status } = useSession();

  // Usa SWR para cache inteligente e revalidação automática da sessão
  const { data, error, isLoading, mutate } = useSWR<Session | null>(
    "/api/auth/session", // Endpoint oficial do NextAuth
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando a página ganha foco
      revalidateOnReconnect: true, // Revalida quando reconecta à internet
      refreshInterval: 20_000, // Revalidação automática a cada 20 segundos
      dedupingInterval: 5_000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    session: data ?? null, // Dados da sessão ou null
    status, // Status do NextAuth (loading, authenticated, unauthenticated)
    isLoading, // Estado de carregamento do SWR
    isError: !!error, // Estado de erro booleano
    mutate, // Função para revalidar manualmente
  } as const;
}
