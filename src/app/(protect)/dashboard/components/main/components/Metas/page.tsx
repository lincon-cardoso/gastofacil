import styles from "./Metas.module.scss";

export default function MetasPage() {
  const metas = [
    { categoria: "Mercado", utilizado: 280, total: 1200 },
    { categoria: "Transporte", utilizado: 520, total: 600 },
    { categoria: "Lazer", utilizado: 180, total: 400 },
  ];

  return (
    <main className={styles.container}>
      {metas.map((meta, index) => (
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
