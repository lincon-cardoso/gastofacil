"use client";
import React, { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";
import { useCategories } from "@/hooks/useCategories";
import { useBudgets } from "@/hooks/useBudgets";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TransactionModal({ open, onClose }: Props) {
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    budgets,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useBudgets();

  // estado para os campos do formulário
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    categoryId: "",
    budgetId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        budgetId: "",
        date: new Date().toISOString().split("T")[0],
      });
      setApiError(null);
    }
  }, [open]);

  // atualiza os valores do formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Mudança no campo ${name}: "${value}"`); // Debug log

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Estado atualizado:", updated); // Debug log
      return updated;
    });
  };

  // envia os dados do formulario para a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId || null,
          budgetId: formData.budgetId,
          date: formData.date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar transação");
      }

      // Limpa o formulário e fecha o modal após sucesso
      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        budgetId: "",
        date: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Nova Transação"
      ariaLabelledBy="transaction-title"
    >
      <div className={styles.modalBody}>
        <form className={styles.transactionForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder="Ex: Compra de mercado"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">Valor</label>
            <input
              type="number"
              step="0.01"
              id="amount"
              name="amount"
              placeholder="Ex: 150.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="categoryId">Categoria</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={categoriesLoading || !!categoriesError}
            >
              <option value="">
                {categoriesLoading
                  ? "Carregando..."
                  : categoriesError
                    ? "Erro ao carregar"
                    : "Selecione uma categoria (opcional)"}
              </option>
              {!categoriesLoading &&
                !categoriesError &&
                categories &&
                categories.length > 0 &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="budgetId">Orçamento</label>
            <select
              id="budgetId"
              name="budgetId"
              value={formData.budgetId}
              onChange={handleChange}
              required
              disabled={budgetsLoading || !!budgetsError}
            >
              <option value="">
                {budgetsLoading
                  ? "Carregando..."
                  : budgetsError
                    ? "Erro ao carregar"
                    : "Selecione um orçamento"}
              </option>
              {!budgetsLoading &&
                !budgetsError &&
                budgets &&
                budgets.length > 0 &&
                budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} - R$ {budget.amount.toFixed(2)}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Data</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {apiError && <p className={styles.error}>{apiError}</p>}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
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
