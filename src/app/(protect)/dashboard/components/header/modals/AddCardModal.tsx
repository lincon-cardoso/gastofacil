"use client";

import React, { useState } from "react";
import { createCardSchema } from "@/schemas/card";
import styles from "../Modal.module.scss";
import { useSessionSWR } from "@/hooks/useSessionSWR";
import { useCards } from "@/hooks/useCards";

type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AddCardModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCardModalProps) {
  const { isLoading: sessionLoading } = useSessionSWR();
  const { cards, isLoading: cardsLoading, refresh: refreshCards } = useCards();
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para edição
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [editDueDay, setEditDueDay] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Estados para exclusão
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  const handleEdit = (
    cardId: string,
    currentName: string,
    currentLimit: number,
    currentDueDay: number
  ) => {
    setEditingCard(cardId);
    setEditName(currentName);
    setEditLimit(currentLimit.toString());
    setEditDueDay(currentDueDay.toString());
    setError(""); // Limpa mensagens de erro
    setSuccess(""); // Limpa mensagens de sucesso
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditName("");
    setEditLimit("");
    setEditDueDay("");
  };

  const handleUpdateCard = async (cardId: string) => {
    setEditLoading(true);
    setError("");

    try {
      const result = createCardSchema.safeParse({
        name: editName,
        limit: Number(editLimit),
        dueDay: Number(editDueDay),
      });

      if (!result.success) {
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const {
        name: parsedName,
        limit: parsedLimit,
        dueDay: parsedDueDay,
      } = result.data;

      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          limit: parsedLimit,
          dueDay: parsedDueDay,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao atualizar cartão");
      }

      setSuccess("Cartão atualizado com sucesso.");
      handleCancelEdit();
      refreshCards();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cartão?")) {
      return;
    }

    setDeletingCard(cardId);
    setError("");

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao excluir cartão");
      }

      setSuccess("Cartão excluído com sucesso.");
      refreshCards();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setDeletingCard(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate and normalize using Zod
      const result = createCardSchema.safeParse({
        name: cardName,
        limit: Number(cardLimit) || 0,
        dueDay: Number(cardDueDay) || 1,
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
        limit: parsedLimit,
        dueDay: parsedDueDay,
      } = result.data;

      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          limit: parsedLimit,
          dueDay: parsedDueDay,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao criar cartão");
      }

      setSuccess("Cartão criado com sucesso.");
      setCardName("");
      setCardLimit("");
      setCardDueDay("");
      refreshCards(); // Atualiza a lista de cartões
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
        <h2>Adicionar Cartão</h2>
        {(sessionLoading || loading) && <p>Processando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="cardName">Nome do Cartão</label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Ex: Nubank"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cardLimit">Limite</label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="cardLimit"
              name="cardLimit"
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
              placeholder="Ex: 2500.00"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cardDueDay">Dia de Fechamento</label>
            <input
              type="number"
              min="1"
              max="31"
              id="cardDueDay"
              name="cardDueDay"
              value={cardDueDay}
              onChange={(e) => setCardDueDay(e.target.value)}
              placeholder="Ex: 15"
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
            Cartões Existentes
          </h3>

          {cardsLoading ? (
            <div className={styles.loadingBudgets}>Carregando cartões...</div>
          ) : cards.length === 0 ? (
            <div className={styles.emptyBudgets}>
              Nenhum cartão encontrado. Crie seu primeiro cartão acima!
            </div>
          ) : (
            <ul className={styles.budgetList}>
              {cards.map((card) => (
                <li key={card.id} className={styles.budgetItem}>
                  {editingCard === card.id ? (
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
                            placeholder="Nome do cartão"
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
                            min="0"
                            value={editLimit}
                            onChange={(e) => setEditLimit(e.target.value)}
                            placeholder="Limite"
                            disabled={editLoading}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={editDueDay}
                            onChange={(e) => setEditDueDay(e.target.value)}
                            placeholder="Dia de fechamento"
                            disabled={editLoading}
                          />
                        </div>
                      </div>
                      <div className={styles.budgetActions}>
                        <button
                          type="button"
                          onClick={() => handleUpdateCard(card.id)}
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
                        <div className={styles.budgetName}>{card.name}</div>
                        <div className={styles.budgetDate}>
                          Dia de fechamento: {card.dueDay}
                        </div>
                      </div>
                      <div className={styles.budgetActions}>
                        <div className={styles.budgetAmount}>
                          Limite: R${" "}
                          {card.limit.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              card.id,
                              card.name,
                              card.limit,
                              card.dueDay
                            )
                          }
                          disabled={
                            loading || editLoading || deletingCard === card.id
                          }
                          className={styles.editButton}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(card.id)}
                          disabled={
                            loading || editLoading || deletingCard === card.id
                          }
                          className={styles.deleteButton}
                        >
                          {deletingCard === card.id
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
