// Hook para gerenciar transações financeiras do usuário com SWR
"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";

// Tipo que define a estrutura de uma transação
type Transaction = {
  id: string;
  description: string | null;
  amount: number; // Valor da transação (positivo = receita, negativo = despesa)
  date: string;
  category: { id: string; name: string } | null; // Categoria associada (opcional)
  budget: { id: string; name: string }; // Orçamento associado (obrigatório)
};

// Função fetcher genérica para requisições com tratamento de erro
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" }); // Evita cache para dados sempre atualizados
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
};

// Hook que retorna lista de transações com cache inteligente
export function useTransactions() {
  const { data: session } = useSession(); // Obtém sessão do NextAuth

  // SWR para buscar transações com cache e revalidação automática
  const {
    data: transactions,
    error,
    mutate: refreshTransactions,
    isLoading,
  } = useSWR<Transaction[]>(
    session?.user ? "/api/dashboard?type=transactions" : null, // Só busca se logado
    fetcher,
    {
      revalidateOnFocus: true, // Revalida quando foca na aba
      revalidateOnReconnect: true, // Revalida quando reconecta
      refreshInterval: 30000, // Atualiza automaticamente a cada 30 segundos
      dedupingInterval: 5000, // Evita requisições duplicadas por 5 segundos
    }
  );

  return {
    transactions: transactions || [], // Lista de transações ou array vazio
    isLoading, // Estado de carregamento
    isError: !!error, // Estado de erro booleano
    refreshTransactions, // Função para atualizar manualmente
  };
}
