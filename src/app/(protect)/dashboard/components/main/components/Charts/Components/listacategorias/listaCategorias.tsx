"use client";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import styles from "./listaCategorias.module.scss";

export default function ListaCategorias() {
  const { categories, isLoading, error } = useCategories();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  if (isLoading) {
    return (
      <div className="lista-categorias__loading">Carregando categorias...</div>
    );
  }

  if (error) {
    return <div className="lista-categorias__error">Erro: {error.message}</div>;
  }

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (endIndex < categories.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (startIndex > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className={styles["lista-categorias"]}>
      <h2 className={styles["lista-categorias__title"]}>Lista de Categorias</h2>
      <ul className={styles["lista-categorias__list"]}>
        {paginatedCategories.map((categoria) => (
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
      <div className={styles["lista-categorias__pagination"]}>
        <button
          onClick={handlePreviousPage}
          disabled={startIndex === 0}
          className={styles["lista-categorias__button"]}
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          disabled={endIndex >= categories.length}
          className={styles["lista-categorias__button"]}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
