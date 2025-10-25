import React from "react";
import { useSessionData } from "@/hooks/useSession";
import styles from "./OrcamentoList.module.scss";

const OrcamentoList: React.FC = () => {
  const { session, isLoading, isError } = useSessionData();

  if (isLoading) return <div>Carregando orçamentos...</div>;
  if (isError) return <div>Erro ao carregar orçamentos</div>;

  if (!session?.orcamentos || session.orcamentos.length === 0) {
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
      {session.orcamentos.map((orcamento, index) => (
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
