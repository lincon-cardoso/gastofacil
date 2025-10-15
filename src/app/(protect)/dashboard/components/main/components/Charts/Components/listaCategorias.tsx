"use client";
import { useCategories } from "@/hooks/useCategories";
import styles from "./listaCategorias.module.scss";

export default function ListaCategorias() {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="lista-categorias__loading">Carregando categorias...</div>
    );
  }

  if (error) {
    return <div className="lista-categorias__error">Erro: {error.message}</div>;
  }

  return (
    <div className={styles["lista-categorias"]}>
      <h2 className={styles["lista-categorias__title"]}>Lista de Categorias</h2>
      <ul className={styles["lista-categorias__list"]}>
        {categories.map((categoria) => (
          <li key={categoria.id} className={styles["lista-categorias__item"]}>
            <strong className={styles["lista-categorias__item-name"]}>
              {categoria.name}
            </strong>
            {categoria.description && (
              <p className={styles["lista-categorias__item-description"]}>
                {categoria.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
