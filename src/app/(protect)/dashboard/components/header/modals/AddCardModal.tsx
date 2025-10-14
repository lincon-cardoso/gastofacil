"use client";
import React, { useState } from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";

type Props = { open: boolean; onClose: () => void };

export default function AddCardModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      limit: parseFloat(formData.get("limit") as string) || 0,
      dueDay: parseInt(formData.get("dueDay") as string) || 1,
    };

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao adicionar cartão");
      }

      // Sucesso - fechar modal e limpar formulário
      onClose();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Erro ao adicionar cartão:", err);
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Adicionar Cartão"
      ariaLabelledBy="add-card-title"
    >
      <div className={styles.modalBody}>
        <form className={styles.transactionForm} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Nome do cartão</label>
            <input
              id="name"
              name="name"
              placeholder="Ex: Nubank"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="limit">Limite</label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="limit"
              name="limit"
              placeholder="Ex: 2500.00"
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
