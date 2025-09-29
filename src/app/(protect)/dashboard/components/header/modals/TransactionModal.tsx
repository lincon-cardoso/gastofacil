"use client";
import React from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TransactionModal({ open, onClose }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Modal Aberto"
      ariaLabelledBy="transaction-title"
    >
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
