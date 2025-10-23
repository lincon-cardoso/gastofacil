"use client";

import React, { useState } from "react";
import { createBudgetSchema } from "@/schemas/budget";
import styles from "../Modal.module.scss";
import { useSessionSWR } from "@/hooks/useSessionSWR";
import { useBudgets } from "@/hooks/useBudgets";

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
  const {
    budgets,
    isLoading: budgetsLoading,
    refresh: refreshBudgets,
  } = useBudgets();
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para edição
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Estados para exclusão
  const [deletingBudget, setDeletingBudget] = useState<string | null>(null);

  const handleEdit = (
    budgetId: string,
    currentName: string,
    currentAmount: number
  ) => {
    setEditingBudget(budgetId);
    setEditName(currentName);
    setEditAmount(currentAmount.toString());
    setError(""); // Limpa mensagens de erro
    setSuccess(""); // Limpa mensagens de sucesso
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setEditName("");
    setEditAmount("");
  };

  const handleUpdateBudget = async (budgetId: string) => {
    setEditLoading(true);
    setError("");

    try {
      const result = createBudgetSchema.safeParse({
        name: editName,
        amount: editAmount,
      });

      if (!result.success) {
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const { name: parsedName, amount: parsedAmount } = result.data;

      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "PUT",
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
        throw new Error(data?.error ?? "Erro ao atualizar orçamento");
      }

      setSuccess("Orçamento atualizado com sucesso.");
      handleCancelEdit();
      refreshBudgets();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) {
      return;
    }

    setDeletingBudget(budgetId);
    setError("");

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao excluir orçamento");
      }

      setSuccess("Orçamento excluído com sucesso.");
      refreshBudgets();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setDeletingBudget(null);
    }
  };

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
      refreshBudgets(); // Atualiza a lista de orçamentos
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
        <div>
          <h3
            style={{
              marginTop: "1.5rem",
              marginBottom: "1rem",
              fontSize: "1.1rem",
              fontWeight: "600",
            }}
          >
            Orçamentos Existentes
          </h3>

          {budgetsLoading ? (
            <div className={styles.loadingBudgets}>
              Carregando orçamentos...
            </div>
          ) : budgets.length === 0 ? (
            <div className={styles.emptyBudgets}>
              Nenhum orçamento encontrado. Crie seu primeiro orçamento acima!
            </div>
          ) : (
            <ul className={styles.budgetList}>
              {budgets.map((budget) => (
                <li key={budget.id} className={styles.budgetItem}>
                  {editingBudget === budget.id ? (
                    // Modo de edição
                    <>
                      <div className={styles.budgetInfo} style={{ flex: 1 }}>
                        <div
                          className={styles.formGroup}
                          style={{ marginBottom: "0.5rem" }}
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome do orçamento"
                            disabled={editLoading}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <input
                            type="text"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="Valor"
                            disabled={editLoading}
                          />
                        </div>
                      </div>
                      <div className={styles.budgetActions}>
                        <button
                          type="button"
                          onClick={() => handleUpdateBudget(budget.id)}
                          disabled={editLoading}
                          className={styles.editButton}
                        >
                          {editLoading ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={editLoading}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    // Modo de visualização
                    <>
                      <div className={styles.budgetInfo}>
                        <div className={styles.budgetName}>{budget.name}</div>
                        <div className={styles.budgetDate}>
                          Criado em:{" "}
                          {new Date(budget.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </div>
                      <div className={styles.budgetActions}>
                        <div className={styles.budgetAmount}>
                          R${" "}
                          {budget.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(budget.id, budget.name, budget.amount)
                          }
                          disabled={
                            loading ||
                            editLoading ||
                            deletingBudget === budget.id
                          }
                          className={styles.editButton}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(budget.id)}
                          disabled={
                            loading ||
                            editLoading ||
                            deletingBudget === budget.id
                          }
                          className={styles.deleteButton}
                        >
                          {deletingBudget === budget.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
