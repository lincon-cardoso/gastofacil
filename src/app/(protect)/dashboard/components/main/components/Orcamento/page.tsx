"use client";

import styles from "./Orcamento.module.scss";
import OrcamentoList from "@/components/orcamento/OrcamentoList";

export default function Orcamento() {
  const orcamentos = [
    { categoria: "Mercado", utilizado: 980, total: 1200 },
    { categoria: "Transporte", utilizado: 520, total: 600 },
    { categoria: "Lazer", utilizado: 380, total: 400 },
    
  ];

  const faturas = [
    { banco: "Nubank", valor: 1120.45, vencimento: "10/10" },
    { banco: "Itaú", valor: 860.12, vencimento: "15/10" },
  ];

  return (
    <main className={styles.orcamentoContainer}>
      <OrcamentoList orcamentos={orcamentos} />
      <div className={styles.faturas}>
        <h2>Faturas próximas</h2>
        {faturas.map((fatura, index) => (
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
        ))}
      </div>
    </main>
  );
}
