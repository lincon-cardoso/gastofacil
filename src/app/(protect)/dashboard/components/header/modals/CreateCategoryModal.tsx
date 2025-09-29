"use client";
import React from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";
import { useCategories } from "@/hooks/useCategories";

type Props = { open: boolean; onClose: () => void };

export default function CreateCategoryModal({ open, onClose }: Props) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { refresh } = useCategories();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe o nome da categoria");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Falha ao criar categoria");
      }
      // sucesso
      setName("");
      setDescription("");
      try {
        // revalida lista de categorias
        if (typeof refresh === "function") await refresh();
      } catch {
        // noop
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Criar Categoria"
      ariaLabelledBy="create-category-title"
    >
      <div className={styles.modalBody}>
        <form
          className={styles.transactionForm}
          onSubmit={handleSubmit}
          aria-labelledby="create-category-title"
        >
          <div className={styles.formGroup}>
            <label htmlFor="categoryName">Nome da categoria</label>
            <input
              id="categoryName"
              name="categoryName"
              placeholder="Ex: Alimentação"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="categoryDescription">Descrição (opcional)</label>
            <input
              id="categoryDescription"
              name="categoryDescription"
              placeholder="Ex: Gastos com alimentação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className={styles.errorMessage}>
              {error}
            </p>
          )}

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
