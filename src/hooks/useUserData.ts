"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

// Tipo para dados do usuário
type UserWithSaldo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Role;
  plan?: {
    id: string;
    name: string;
    price: number;
  };
};

// Tipo para sessão
type SessionWithSaldo = {
  user: UserWithSaldo;
  expires: string;
  userId?: string;
};

// Tipo para dados unificados do dashboard - ATUALIZADO: dados completos em uma única estrutura
type DashboardData = {
  totalReceita: number;
  totalTransacoes: number;
  saldoAtual: number;
  totalOrcamentoCartao: number;
};

// Função fetcher para requisições
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
};

export function useUserData() {
  const { data: session, status } = useSession();

  // SWR para dados unificados do dashboard - REFATORADO: uma única rota para todos os dados
  const {
    data: dashboardData,
    error: dashboardError,
    mutate: refreshDashboard,
    isLoading: dashboardLoading,
  } = useSWR<DashboardData>(session?.user ? "/api/dashboard" : null, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    dedupingInterval: 5000,
  });

  // Estado de carregamento simplificado - REFATORADO: dados unificados
  const isLoading = status === "loading" || dashboardLoading;

  // Verificação de erro simplificada
  const isError = !!dashboardError;

  // Sessão construída
  const sessionWithSaldo: SessionWithSaldo | null = session
    ? ({
        ...session,
        user: {
          ...session.user,
        },
      } as SessionWithSaldo)
    : null;

  // Retorno com todos os dados do dashboard - REFATORADO: dados unificados da API
  return {
    session: sessionWithSaldo,
    isLoading,
    isError,
    totalReceita: dashboardData?.totalReceita || 0,
    totalTransacoes: dashboardData?.totalTransacoes || 0,
    saldoAtual: dashboardData?.saldoAtual || 0,
    totalOrcamentoCartao: dashboardData?.totalOrcamentoCartao || 0,
    
    refreshDashboard,
  };
}
