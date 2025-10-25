"use client";

import styles from "./Orcamento.module.scss";
import OrcamentoList from "@/components/orcamento/OrcamentoList";
import { useBudgets } from "@/hooks/useBudgets";
import { useCards } from "@/hooks/useCards";

export default function Orcamento() {
  const {
    budgets,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useBudgets();
  const { cards, isLoading: cardsLoading, error: cardsError } = useCards();

  // Converte orçamentos para o formato esperado pelo OrcamentoList
  const orcamentos = budgets.map((budget) => ({
    categoria: budget.name,
    utilizado: 0, // TODO: Calcular valor utilizado baseado nas transações
    total: budget.amount,
  }));

  // Converte cartões para faturas
  const faturas = cards.map((card) => ({
    banco: card.name,
    valor: card.limit,
    vencimento: `${card.dueDay}/${new Date().getMonth() + 1}`,
  }));

  // Estados de carregamento e erro
  if (budgetsLoading || cardsLoading) {
    return (
      <div className={styles.orcamentoContainer}>Carregando orçamentos...</div>
    );
  }

  if (budgetsError || cardsError) {
    return (
      <div className={styles.orcamentoContainer}>Erro ao carregar dados</div>
    );
  }

  return (
    <main className={styles.orcamentoContainer}>
      <OrcamentoList orcamentos={orcamentos} />
      <div className={styles.faturas}>
        <h2>Faturas próximas</h2>
        {faturas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma fatura encontrada</p>
            <p>Adicione alguns cartões para visualizar as faturas próximas</p>
          </div>
        ) : (
          faturas.map((fatura, index) => (
            <div key={index} className={styles.faturaCard}>
              <div className={styles.faturaInfo}>
                <div className={styles.bancoIcon}>
                  {fatura.banco.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span>{fatura.banco}</span>
                  <span>Vence em {fatura.vencimento}</span>
                </div>
              </div>
              <div className={styles.faturaValor}>
                <span>R$ {fatura.valor.toFixed(2)}</span>
                <button>Pagar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
