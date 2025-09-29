"use client";
import React from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";

type Props = { open: boolean; onClose: () => void };

export default function FiltersModal({ open, onClose }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Filtros"
      ariaLabelledBy="filters-title"
    >
      <div className={styles.modalBody}>
        <form
          className={styles.filtersForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formGroup}>
            <label htmlFor="categoryFilter">Categoria</label>
            <select id="categoryFilter" name="categoryFilter">
              <option value="">Todas</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="lazer">Lazer</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dateFilter">Data</label>
            <input type="date" id="dateFilter" name="dateFilter" />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              Aplicar
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
