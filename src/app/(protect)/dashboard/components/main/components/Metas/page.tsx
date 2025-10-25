"use client";

import { useMetas } from "@/hooks/useMetas";
import styles from "./Metas.module.scss";

export default function MetasPage() {
  const { metas, isLoading, error } = useMetas();

  if (isLoading) return <div className={styles.container}>Carregando metas...</div>;
  if (error) return <div className={styles.container}>Erro ao carregar metas: {error.message}</div>;
  
  if (metas.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Nenhuma meta encontrada</h2>
          <p>Adicione algumas metas para visualizar o progresso aqui</p>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <h2>Suas Metas</h2>
      {metas.map((meta) => {
        const progressPercentage = meta.targetAmount > 0 
          ? (meta.currentAmount / meta.targetAmount) * 100 
          : 0;
        
        return (
          <div key={meta.id} className={styles.metaCard}>
            <h3>{meta.name}</h3>
            <p>Atual: R$ {meta.currentAmount.toFixed(2)}</p>
            <p>Meta: R$ {meta.targetAmount.toFixed(2)}</p>
            {meta.deadline && (
              <p>Prazo: {new Date(meta.deadline).toLocaleDateString("pt-BR")}</p>
            )}
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className={styles.percentage}>
              {`${progressPercentage.toFixed(0)}% atingido`}
            </div>
          </div>
        );
      })}
    </main>
  );
}
