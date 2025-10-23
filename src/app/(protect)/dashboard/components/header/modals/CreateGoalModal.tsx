"use client";

import React, { useState } from "react";
import { createGoalSchema } from "@/schemas/goal";
import styles from "../Modal.module.scss";
import { useSessionSWR } from "@/hooks/useSessionSWR";
import { useMetas } from "@/hooks/useMetas";

type CreateGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateGoalModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGoalModalProps) {
  const { isLoading: sessionLoading } = useSessionSWR();
  const { metas, isLoading: metasLoading, refresh: refreshMetas } = useMetas();
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para edição
  const [editingMeta, setEditingMeta] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Estados para exclusão
  const [deletingMeta, setDeletingMeta] = useState<string | null>(null);

  const handleEdit = (
    metaId: string,
    currentName: string,
    currentTargetAmount: number,
    currentDeadline: string | null
  ) => {
    setEditingMeta(metaId);
    setEditName(currentName);
    setEditTargetAmount(currentTargetAmount.toString());
    setEditDeadline(currentDeadline || "");
    setError(""); // Limpa mensagens de erro
    setSuccess(""); // Limpa mensagens de sucesso
  };

  const handleCancelEdit = () => {
    setEditingMeta(null);
    setEditName("");
    setEditTargetAmount("");
    setEditDeadline("");
  };

  const handleUpdateMeta = async (metaId: string) => {
    setEditLoading(true);
    setError("");

    try {
      const result = createGoalSchema.safeParse({
        name: editName,
        targetAmount: Number(editTargetAmount),
        deadline: editDeadline || undefined,
      });

      if (!result.success) {
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const {
        name: parsedName,
        targetAmount: parsedTargetAmount,
        deadline: parsedDeadline,
      } = result.data;

      const response = await fetch(`/api/metas/${metaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          targetAmount: parsedTargetAmount,
          deadline: parsedDeadline,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao atualizar meta");
      }

      setSuccess("Meta atualizada com sucesso.");
      handleCancelEdit();
      refreshMetas();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (metaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) {
      return;
    }

    setDeletingMeta(metaId);
    setError("");

    try {
      const response = await fetch(`/api/metas/${metaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao excluir meta");
      }

      setSuccess("Meta excluída com sucesso.");
      refreshMetas();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setDeletingMeta(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate and normalize using Zod
      const result = createGoalSchema.safeParse({
        name: goalName,
        targetAmount: Number(targetAmount),
        deadline: deadline || undefined,
      });

      if (!result.success) {
        // use first error message from Zod (issues is the correct property)
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const {
        name: parsedName,
        targetAmount: parsedTargetAmount,
        deadline: parsedDeadline,
      } = result.data;

      const response = await fetch("/api/metas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          targetAmount: parsedTargetAmount,
          deadline: parsedDeadline,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao criar meta");
      }

      setSuccess("Meta criada com sucesso.");
      setGoalName("");
      setTargetAmount("");
      setDeadline("");
      refreshMetas(); // Atualiza a lista de metas
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
        <h2>Criar Meta</h2>
        {(sessionLoading || loading) && <p>Processando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="goalName">Nome da Meta</label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Ex: Viagem"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="targetAmount">Valor Alvo</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="targetAmount"
              name="targetAmount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Ex: 5000.00"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="deadline">Prazo (opcional)</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
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
            Metas Existentes
          </h3>

          {metasLoading ? (
            <div className={styles.loadingBudgets}>Carregando metas...</div>
          ) : metas.length === 0 ? (
            <div className={styles.emptyBudgets}>
              Nenhuma meta encontrada. Crie sua primeira meta acima!
            </div>
          ) : (
            <ul className={styles.budgetList}>
              {metas.map((meta) => (
                <li key={meta.id} className={styles.budgetItem}>
                  {editingMeta === meta.id ? (
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
                            placeholder="Nome da meta"
                            disabled={editLoading}
                          />
                        </div>
                        <div
                          className={styles.formGroup}
                          style={{ marginBottom: "0.5rem" }}
                        >
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editTargetAmount}
                            onChange={(e) =>
                              setEditTargetAmount(e.target.value)
                            }
                            placeholder="Valor alvo"
                            disabled={editLoading}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <input
                            type="date"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                            disabled={editLoading}
                          />
                        </div>
                      </div>
                      <div className={styles.budgetActions}>
                        <button
                          type="button"
                          onClick={() => handleUpdateMeta(meta.id)}
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
                        <div className={styles.budgetName}>{meta.name}</div>
                        <div className={styles.budgetDate}>
                          Criado em:{" "}
                          {new Date(meta.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                        {meta.deadline && (
                          <div className={styles.budgetDate}>
                            Prazo:{" "}
                            {new Date(meta.deadline).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.budgetActions}>
                        <div className={styles.budgetAmount}>
                          Meta: R${" "}
                          {meta.targetAmount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className={styles.budgetAmount}>
                          Atual: R${" "}
                          {meta.currentAmount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              meta.id,
                              meta.name,
                              meta.targetAmount,
                              meta.deadline
                            )
                          }
                          disabled={
                            loading || editLoading || deletingMeta === meta.id
                          }
                          className={styles.editButton}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(meta.id)}
                          disabled={
                            loading || editLoading || deletingMeta === meta.id
                          }
                          className={styles.deleteButton}
                        >
                          {deletingMeta === meta.id
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
