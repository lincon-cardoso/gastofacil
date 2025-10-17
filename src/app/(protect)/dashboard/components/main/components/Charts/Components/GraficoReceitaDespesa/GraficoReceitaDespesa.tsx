import { useUserData } from "@/hooks/useUserData";
import { useTransactions } from "@/hooks/useTransactions";

export default function GraficoReceitaDespesa() {
  const { isLoading, isError } = useUserData();

  const {
    transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useTransactions();

  if (isLoading || transactionsLoading) {
    return (
      <main>
        <h1>Gráfico de Receita e Despesa</h1>
        <p>Carregando dados...</p>
      </main>
    );
  }

  if (isError || transactionsError) {
    return (
      <main>
        <h1>Gráfico de Receita e Despesa</h1>
        <p>Erro ao carregar os dados.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Transações</h1>

      {/* Lista de transações */}
      <div>
        {transactions && transactions.length > 0 ? (
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.id} style={{ marginBottom: "8px" }}>
                <strong>{transaction.description || "Sem descrição"}</strong> -
                R$ {Number(transaction.amount).toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma transação encontrada.</p>
        )}
      </div>
    </main>
  );
}
