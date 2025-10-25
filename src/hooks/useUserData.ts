// Hook unificado para gerenciar dados do usuário e dashboard
"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

// Tipo para dados estendidos do usuário
type UserWithSaldo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Role; // Papel do usuário no sistema
  plan?: {
    id: string;
    name: string;
    price: number;
  }; // Plano de assinatura do usuário
};

// Tipo para sessão estendida
type SessionWithSaldo = {
  user: UserWithSaldo;
  expires: string;
  userId?: string;
};

// Tipo para dados unificados do dashboard - todos os dados principais em uma estrutura
type DashboardData = {
  totalReceita: number; // Total de receitas do usuário
  totalTransacoes: number; // Total de gastos/transações
  saldoAtual: number; // Saldo atual (receitas - gastos)
  totalOrcamentoCartao: number; // Total de orçamentos em cartões
};

// Função fetcher genérica para requisições com tratamento de erro
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
};

// Hook central que fornece todos os dados do usuário e dashboard unificados
export function useUserData() {
  const { data: session, status } = useSession(); // Obtém sessão do NextAuth

  // SWR para dados unificados do dashboard - uma única rota para todos os dados principais
  const {
    data: dashboardData,
    error: dashboardError,
    mutate: refreshDashboard,
    isLoading: dashboardLoading,
  } = useSWR<DashboardData>(
    session?.user ? "/api/dashboard" : null, // Só busca se logado
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 30000, // Atualiza automaticamente a cada 30 segundos
      dedupingInterval: 5000, // Evita requisições duplicadas por 5 segundos
    }
  );

  // Estado de carregamento consolidado
  const isLoading = status === "loading" || dashboardLoading;

  // Verificação de erro simplificada
  const isError = !!dashboardError;

  // Sessão construída com dados estendidos
  const sessionWithSaldo: SessionWithSaldo | null = session
    ? ({
        ...session,
        user: {
          ...session.user,
        },
      } as SessionWithSaldo)
    : null;

  // Retorna todos os dados consolidados do usuário e dashboard
  return {
    session: sessionWithSaldo, // Sessão com dados do usuário
    isLoading, // Estado de carregamento
    isError, // Estado de erro
    // Dados financeiros com valores padrão
    totalReceita: dashboardData?.totalReceita || 0,
    totalTransacoes: dashboardData?.totalTransacoes || 0,
    saldoAtual: dashboardData?.saldoAtual || 0,
    totalOrcamentoCartao: dashboardData?.totalOrcamentoCartao || 0,

    refreshDashboard, // Função para atualizar dados manualmente
  };
}
