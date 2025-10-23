"use client";

import React, { useState } from "react";
import { createCategorySchema } from "@/schemas/category";
import styles from "../Modal.module.scss";
import { useSessionSWR } from "@/hooks/useSessionSWR";
import { useCategories } from "@/hooks/useCategories";

type CreateCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const { isLoading: sessionLoading } = useSessionSWR();
  const {
    categories,
    isLoading: categoriesLoading,
    refresh: refreshCategories,
  } = useCategories();
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para edição
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Estados para exclusão
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const handleEdit = (
    categoryId: string,
    currentName: string,
    currentDescription: string | null | undefined
  ) => {
    setEditingCategory(categoryId);
    setEditName(currentName);
    setEditDescription(currentDescription || "");
    setError(""); // Limpa mensagens de erro
    setSuccess(""); // Limpa mensagens de sucesso
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdateCategory = async (categoryId: string) => {
    setEditLoading(true);
    setError("");

    try {
      const result = createCategorySchema.safeParse({
        name: editName,
        description: editDescription || undefined,
      });

      if (!result.success) {
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const { name: parsedName, description: parsedDescription } = result.data;

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          description: parsedDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao atualizar categoria");
      }

      setSuccess("Categoria atualizada com sucesso.");
      handleCancelEdit();
      refreshCategories();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    setDeletingCategory(categoryId);
    setError("");

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao excluir categoria");
      }

      setSuccess("Categoria excluída com sucesso.");
      refreshCategories();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate and normalize using Zod
      const result = createCategorySchema.safeParse({
        name: categoryName,
        description: categoryDescription || undefined,
      });

      if (!result.success) {
        // use first error message from Zod (issues is the correct property)
        const zodMessage = result.error.issues?.[0]?.message;
        throw new Error(
          zodMessage ?? "Erro ao validar os dados do formulário."
        );
      }

      const { name: parsedName, description: parsedDescription } = result.data;

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName,
          description: parsedDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao criar categoria");
      }

      setSuccess("Categoria criada com sucesso.");
      setCategoryName("");
      setCategoryDescription("");
      refreshCategories(); // Atualiza a lista de categorias
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
        <h2>Criar Categoria</h2>
        {(sessionLoading || loading) && <p>Processando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="categoryName">Nome da Categoria</label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: Alimentação"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="categoryDescription">Descrição (opcional)</label>
            <input
              type="text"
              id="categoryDescription"
              name="categoryDescription"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Ex: Gastos com alimentação"
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
            Categorias Existentes
          </h3>

          {categoriesLoading ? (
            <div className={styles.loadingBudgets}>
              Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.emptyBudgets}>
              Nenhuma categoria encontrada. Crie sua primeira categoria acima!
            </div>
          ) : (
            <ul className={styles.budgetList}>
              {categories.map((category) => (
                <li key={category.id} className={styles.budgetItem}>
                  {editingCategory === category.id ? (
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
                            placeholder="Nome da categoria"
                            disabled={editLoading}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Descrição (opcional)"
                            disabled={editLoading}
                          />
                        </div>
                      </div>
                      <div className={styles.budgetActions}>
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(category.id)}
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
                        <div className={styles.budgetName}>{category.name}</div>
                        {category.description && (
                          <div className={styles.budgetDate}>
                            {category.description}
                          </div>
                        )}
                      </div>
                      <div className={styles.budgetActions}>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              category.id,
                              category.name,
                              category.description
                            )
                          }
                          disabled={
                            loading ||
                            editLoading ||
                            deletingCategory === category.id
                          }
                          className={styles.editButton}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          disabled={
                            loading ||
                            editLoading ||
                            deletingCategory === category.id
                          }
                          className={styles.deleteButton}
                        >
                          {deletingCategory === category.id
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
