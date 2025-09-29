"use client";

import React, { useState } from "react";
import { createBudgetSchema } from "@/schemas/budget";
import styles from "../Modal.module.scss";
import { useSessionSWR } from "@/hooks/useSessionSWR";


type CreateMonthlyBudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateMonthlyBudgetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMonthlyBudgetModalProps) {
  const { isLoading: sessionLoading } = useSessionSWR();
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate and normalize using Zod
      const result = createBudgetSchema.safeParse({
        name: budgetName,
        amount: budgetAmount,
      });

      if (!result.success) {
        // use first error message from Zod (issues is the correct property)
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const { name: parsedName, amount: parsedAmount } = result.data;

      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          amount: parsedAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao criar orçamento");
      }

      setSuccess("Orçamento criado com sucesso.");
      setBudgetName("");
      setBudgetAmount("");
      onClose(); // Fecha o modal após o sucesso
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Criar Orçamento do Mês</h2>
        {(sessionLoading || loading) && <p>Processando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="budgetName">Nome do Orçamento</label>
            <input
              type="text"
              id="budgetName"
              name="budgetName"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="budgetAmount">Valor</label>
            <input
              type="text"
              id="budgetAmount"
              name="budgetAmount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading || sessionLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || sessionLoading}
            >
              {loading ? "Criando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
