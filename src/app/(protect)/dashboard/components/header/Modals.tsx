"use client";
import React from "react";
import styles from "./Header.module.scss";
import { closeModal, closeFilters, closeCalendar } from "./headerFunctions";

type ModalsProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  calendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modals({
  modalOpen,
  setModalOpen,
  filtersOpen,
  setFiltersOpen,
  calendarOpen,
  setCalendarOpen,
}: ModalsProps) {
  return (
    <>
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => closeModal(setModalOpen)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2>Modal Aberto</h2>
            </header>
            <div className={styles.modalBody}>
              <form
                className={styles.transactionForm}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="description">Descrição</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Ex: Compra de mercado"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="amount">Valor</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Ex: 150.00"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Categoria</label>
                  <select id="category" name="category" required>
                    <option value="">Selecione</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="lazer">Lazer</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Data</label>
                  <input type="date" id="date" name="date" required />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveButton}>
                    Salvar
                  </button>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => closeModal(setModalOpen)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
            <footer className={styles.modalActions}>
              <button
                className={styles.closeButton}
                onClick={() => closeModal(setModalOpen)}
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}

      {filtersOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => closeFilters(setFiltersOpen)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2>Filtros</h2>
            </header>
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
                    onClick={() => closeFilters(setFiltersOpen)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {calendarOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => closeCalendar(setCalendarOpen)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2>Calendário</h2>
            </header>
            <div className={styles.modalBody}>
              <p>
                Insira aqui o componente de calendário ou funcionalidade
                desejada.
              </p>
            </div>
            <footer className={styles.modalActions}>
              <button
                className={styles.closeButton}
                onClick={() => closeCalendar(setCalendarOpen)}
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
      
    </>
  );
}
