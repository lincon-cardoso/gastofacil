"use client";
import React from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";

type Props = { open: boolean; onClose: () => void };

export default function CreateGoalModal({ open, onClose }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Criar Meta"
      ariaLabelledBy="create-goal-title"
    >
      <div className={styles.modalBody}>
        <form
          className={styles.transactionForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formGroup}>
            <label htmlFor="goalName">Nome da meta</label>
            <input
              id="goalName"
              name="goalName"
              placeholder="Ex: Viagem"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="targetAmount">Valor alvo</label>
            <input
              type="number"
              step="0.01"
              id="targetAmount"
              name="targetAmount"
              placeholder="Ex: 5000.00"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="deadline">Prazo</label>
            <input type="date" id="deadline" name="deadline" />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              Salvar
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
      <footer className={styles.modalActions}>
        <button className={styles.closeButton} onClick={onClose}>
          Fechar
        </button>
      </footer>
    </BaseModal>
  );
}
