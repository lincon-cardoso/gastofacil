// Hook para adicionar novas transações financeiras
"use client";

import { useState } from "react";
import { useTransactionMutate } from "@/hooks/useTransactionMutate";

// Tipo para dados de entrada da transação
type TransactionData = {
  description: string;
  amount: number; // Valor pode ser positivo (receita) ou negativo (despesa)
  budgetId: string; // ID do orçamento associado
  categoryId?: string; // ID da categoria (opcional)
  date?: string; // Data da transação (opcional)
};

// Tipo para transação completa retornada pela API
type Transaction = {
  id: string;
  description: string;
  amount: number;
  budgetId: string;
  categoryId: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
  budget?: {
    id: string;
    name: string;
  };
};

// Tipo para resultado da operação de adição
type AddTransactionResult = {
  message: string;
  transaction: Transaction;
};

// Hook que fornece funcionalidade para adicionar transações
export function useAddTransaction() {
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState<string | null>(null); // Estado de erro
  const { handleTransactionChange } = useTransactionMutate(); // Hook para invalidar cache

  // Função principal para adicionar uma nova transação
  const addTransaction = async (
    transactionData: TransactionData
  ): Promise<AddTransactionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Envia dados para a API
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar transação");
      }

      // Atualiza dados relacionados no cache (orçamentos, dashboard, etc.)
      await handleTransactionChange();

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTransaction, // Função para adicionar transação
    isLoading, // Estado de carregamento
    error, // Mensagem de erro se houver
  };
}
