"use client";
import styles from "./Transacoes.module.scss";
import { useState } from "react";

const mockTransactions = [
  {
    id: "TX-9812",
    description: "Supermercado Brasil",
    category: "Mercado",
    date: "02/09",
    value: -186.34,
  },
  {
    id: "TX-9813",
    description: "Uber",
    category: "Transporte",
    date: "05/09",
    value: -22.9,
  },
  {
    id: "TX-9814",
    description: "Salário",
    category: "Renda",
    date: "07/09",
    value: 5900.0,
  },
  {
    id: "TX-9815",
    description: "Aluguel",
    category: "Moradia",
    date: "10/09",
    value: -1450.0,
  },
  {
    id: "TX-9816",
    description: "Café",
    category: "Lazer",
    date: "11/09",
    value: -9.5,
  },
];

export default function Transacoes() {
  const [filter, setFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredTransactions = mockTransactions.filter((transaction) => {
    if (filter === "Todos") return true;
    if (filter === "Receita") return transaction.value > 0;
    if (filter === "Despesa") return transaction.value < 0;
    return true;
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
                <span className={styles.category}>{transaction.category}</span>
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
    </main>
  );
}
