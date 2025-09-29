"use client";
import React from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";

type Props = { open: boolean; onClose: () => void };

export default function AddCardModal({ open, onClose }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Adicionar Cartão"
      ariaLabelledBy="add-card-title"
    >
      <div className={styles.modalBody}>
        <form
          className={styles.transactionForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formGroup}>
            <label htmlFor="cardName">Nome do cartão</label>
            <input
              id="cardName"
              name="cardName"
              placeholder="Ex: Nubank"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cardNumber">Número</label>
            <input
              id="cardNumber"
              name="cardNumber"
              placeholder="#### #### #### ####"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="limit">Limite</label>
            <input
              type="number"
              step="0.01"
              id="limit"
              name="limit"
              placeholder="Ex: 2500.00"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dueDay">Dia de fechamento</label>
            <input
              type="number"
              min={1}
              max={31}
              id="dueDay"
              name="dueDay"
              placeholder="Ex: 15"
            />
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
