"use client";
import React, { useState } from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";

type Props = { open: boolean; onClose: () => void };

export default function CreateGoalModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("goalName") as string,
      targetAmount: parseFloat(formData.get("targetAmount") as string),
      deadline: (formData.get("deadline") as string) || undefined,
    };

    try {
      console.log("Enviando dados da meta:", data);

      const response = await fetch("/api/metas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Resposta da API:", result);

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar meta");
      }

      // Sucesso - fechar modal e limpar formulário
      onClose();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Erro ao criar meta:", err);
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Criar Meta"
      ariaLabelledBy="create-goal-title"
    >
      <div className={styles.modalBody}>
        <form className={styles.transactionForm} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="goalName">Nome da meta</label>
            <input
              id="goalName"
              name="goalName"
              placeholder="Ex: Viagem"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="targetAmount">Valor alvo</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="targetAmount"
              name="targetAmount"
              placeholder="Ex: 5000.00"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deadline">Prazo (opcional)</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
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
