import React from "react";
import styles from "./OrcamentoList.module.scss";

interface Orcamento {
  categoria: string;
  utilizado: number;
  total: number;
}

interface OrcamentoListProps {
  orcamentos: Orcamento[];
}

const OrcamentoList: React.FC<OrcamentoListProps> = ({ orcamentos }) => {
  if (!orcamentos || orcamentos.length === 0) {
    return (
      <div className={styles.orcamentos}>
        <h2>Orçamentos do mês</h2>
        <div className={styles.emptyState}>
          <div>💰</div>
          <p>Nenhum orçamento encontrado</p>
          <span>
            Crie alguns orçamentos para acompanhar seus gastos mensais
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orcamentos}>
      <h2>Orçamentos do mês</h2>
      {orcamentos.map((orcamento, index) => {
        const progressPercentage =
          orcamento.total > 0
            ? (orcamento.utilizado / orcamento.total) * 100
            : 0;

        return (
          <div key={index} className={styles.orcamentoCard}>
            <div className={styles.orcamentoInfo}>
              <span>{orcamento.categoria}</span>
              <span>
                R$ {orcamento.utilizado.toFixed(2)} / R${" "}
                {orcamento.total.toFixed(2)}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${Math.min(progressPercentage, 100)}%`,
                }}
              ></div>
            </div>
            <span>
              {Math.round(progressPercentage)}% do orçamento utilizado
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OrcamentoList;
