import { useSessionData } from "@/hooks/useSession";
import styles from "./Metas.module.scss";

export default function MetasPage() {
  const { session, isLoading, isError } = useSessionData();

  if (isLoading) return <div>Carregando metas...</div>;
  if (isError) return <div>Erro ao carregar metas</div>;
  if (!session?.metas) return <div>Nenhuma meta encontrada</div>;

  return (
    <main className={styles.container}>
      {session.metas.map((meta, index) => (
        <div key={index} className={styles.metaCard}>
          <h3>{meta.categoria}</h3>
          <p>Utilizado: R$ {meta.utilizado.toFixed(2)}</p>
          <p>Total: R$ {meta.total.toFixed(2)}</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: `${(meta.utilizado / meta.total) * 100}%` }}
            ></div>
          </div>
          <div
            className={styles.percentage}
          >{`${((meta.utilizado / meta.total) * 100).toFixed(0)}% atingido`}</div>
        </div>
      ))}
    </main>
  );
}
