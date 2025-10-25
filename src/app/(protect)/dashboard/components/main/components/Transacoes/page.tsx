"use client";
import styles from "./Transacoes.module.scss";
import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";

export default function Transacoes() {
  const [filter, setFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { transactions, isLoading, isError } = useTransactions();

  // Estados de carregamento e erro
  if (isLoading) {
    return <div className={styles.container}>Carregando transações...</div>;
  }

  if (isError) {
    return <div className={styles.container}>Erro ao carregar transações</div>;
  }

  // Converte transações para o formato esperado
  const formattedTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    description: transaction.description || "Sem descrição",
    category: transaction.category?.name || "Sem categoria",
    date: new Date(transaction.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: transaction.amount,
  }));

  // Filtra transações baseado no filtro selecionado e termo de busca
  const filteredTransactions = formattedTransactions.filter((transaction) => {
    const matchesFilter =
      filter === "Todos" ||
      (filter === "Receita" && transaction.value > 0) ||
      (filter === "Despesa" && transaction.value < 0);

    const matchesSearch =
      searchTerm === "" ||
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <main className={styles.container}>
      <div className={styles.filtersWrapper}>
        <h1>Transações Recentes</h1>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Buscar..."
            className={styles.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className={styles.menuWrapper}>
            <button
              className={styles.filterButton}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {filter}
            </button>
            {menuOpen && (
              <ul className={styles.menuList}>
                <li
                  onClick={() => {
                    setFilter("Todos");
                    setMenuOpen(false);
                  }}
                >
                  Todos
                </li>
                <li
                  onClick={() => {
                    setFilter("Receita");
                    setMenuOpen(false);
                  }}
                >
                  Receita
                </li>
                <li
                  onClick={() => {
                    setFilter("Despesa");
                    setMenuOpen(false);
                  }}
                >
                  Despesa
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
      {filteredTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma transação encontrada</p>
          <p>Adicione algumas transações para visualizar aqui</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.description}</td>
                <td>
                  <span className={styles.category}>
                    {transaction.category}
                  </span>
                </td>
                <td>{transaction.date}</td>
                <td
                  className={
                    transaction.value < 0 ? styles.negative : styles.positive
                  }
                >
                  {transaction.value < 0
                    ? `-R$ ${Math.abs(transaction.value).toFixed(2)}`
                    : `R$ ${transaction.value.toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
