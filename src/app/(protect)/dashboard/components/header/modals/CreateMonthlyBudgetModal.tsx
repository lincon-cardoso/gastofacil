"use client";

import React from "react";
import styles from "../Modal.module.scss";

type CreateMonthlyBudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateMonthlyBudgetModal({
  isOpen,
  onClose,
}: CreateMonthlyBudgetModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Criar Orçamento do Mês</h2>
        <form>
          <div className={styles.formGroup}>
            <label htmlFor="budgetName">Nome do Orçamento</label>
            <input type="text" id="budgetName" name="budgetName" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="budgetAmount">Valor</label>
            <input
              type="number"
              id="budgetAmount"
              name="budgetAmount"
              required
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
