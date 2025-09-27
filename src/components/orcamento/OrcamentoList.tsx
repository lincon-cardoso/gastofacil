import React from "react";
import styles from "./OrcamentoList.module.scss";

type Orcamento = {
  categoria: string;
  utilizado: number;
  total: number;
};

type OrcamentoListProps = {
  orcamentos: Orcamento[];
};

const OrcamentoList: React.FC<OrcamentoListProps> = ({ orcamentos }) => {
  return (
    <div className={styles.orcamentos}>
      <h2>Orçamentos do mês</h2>
      {orcamentos.map((orcamento, index) => (
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
                width: `${(orcamento.utilizado / orcamento.total) * 100}%`,
              }}
            ></div>
          </div>
          <span>
            {Math.round((orcamento.utilizado / orcamento.total) * 100)}% do
            orçamento utilizado
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrcamentoList;
