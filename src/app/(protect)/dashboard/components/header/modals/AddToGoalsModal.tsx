"use client";
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";
import { useMetas } from "@/hooks/useMetas";
import { useAddAmountToGoal } from "@/hooks/useAddAmountToGoal";

type Props = {
  open: boolean;
  onClose: () => void;
};

type FormData = {
  selectedGoal: string;
  amount: string;
};

export default function AddToGoalsModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState<FormData>({
    selectedGoal: "",
    amount: "",
  });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  const { metas, isLoading: metasLoading } = useMetas();
  const {
    addAmountToGoal,
    isLoading: addingAmount,
    error,
  } = useAddAmountToGoal();

  // Reset form quando modal abrir
  useEffect(() => {
    if (open) {
      setFormData({ selectedGoal: "", amount: "" });
      setSuccessMessage("");
    }
  }, [open]);

  // Memoizar dados da meta selecionada para evitar re-renderizações
  const selectedGoalData = useMemo(
    () => metas.find((goal) => goal.id === formData.selectedGoal),
    [metas, formData.selectedGoal]
  );

  const remainingAmount = useMemo(
    () =>
      selectedGoalData
        ? selectedGoalData.targetAmount - selectedGoalData.currentAmount
        : 0,
    [selectedGoalData]
  );

  // Função otimizada para mudanças no select
  const handleGoalChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        selectedGoal: e.target.value,
      }));
    },
    []
  );

  // Função otimizada para mudanças no input de valor
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Permite apenas números, vírgula e ponto
      value = value.replace(/[^0-9.,]/g, "");

      // Substitui vírgula por ponto para padronização
      value = value.replace(",", ".");

      // Evita múltiplos pontos
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }

      // Limita a 2 casas decimais
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + "." + parts[1].substring(0, 2);
      }

      setFormData((prev) => ({
        ...prev,
        amount: value,
      }));
    },
    []
  );

  // Função para formatar o valor no blur
  const handleAmountBlur = useCallback(() => {
    if (formData.amount && !isNaN(Number(formData.amount))) {
      const numValue = parseFloat(formData.amount);
      setFormData((prev) => ({
        ...prev,
        amount: numValue.toFixed(2),
      }));
    }
  }, [formData.amount]);

  // Função para focar no input ao clicar no label
  const handleLabelClick = useCallback(() => {
    amountInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const numAmount = parseFloat(formData.amount);

      if (!formData.selectedGoal || !formData.amount || numAmount <= 0) {
        alert("Por favor, selecione uma meta e insira um valor válido.");
        return;
      }

      if (selectedGoalData && numAmount > remainingAmount) {
        alert(`O valor máximo permitido é R$ ${remainingAmount.toFixed(2)}`);
        return;
      }

      const result = await addAmountToGoal(formData.selectedGoal, numAmount);

      if (result) {
        setSuccessMessage(result.message);
        setFormData({ selectedGoal: "", amount: "" });

        // Fechar modal após 2.5 segundos
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 2500);
      }
    },
    [formData, selectedGoalData, remainingAmount, addAmountToGoal, onClose]
  );

  const handleClose = useCallback(() => {
    setFormData({ selectedGoal: "", amount: "" });
    setSuccessMessage("");
    onClose();
  }, [onClose]);

  // Formatar valor para exibição
  const formatCurrency = useCallback(
    (value: number) =>
      value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="💰 Adicionar Dinheiro às Metas"
      ariaLabelledBy="add-to-goals-title"
    >
      <div className={styles.modalBody}>
        {successMessage ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <p>{successMessage}</p>
            <small>Fechando automaticamente...</small>
          </div>
        ) : (
          <form className={styles.addToGoalsForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="goalSelect" className={styles.formLabel}>
                🎯 Selecione a Meta
              </label>
              {metasLoading ? (
                <div className={styles.loadingMetas}>
                  <span>⏳ Carregando metas...</span>
                </div>
              ) : metas.length === 0 ? (
                <div className={styles.noMetas}>
                  <span>📝 Nenhuma meta encontrada.</span>
                  <small>
                    Crie uma meta primeiro para poder adicionar valores.
                  </small>
                </div>
              ) : (
                <select
                  id="goalSelect"
                  name="goalSelect"
                  value={formData.selectedGoal}
                  onChange={handleGoalChange}
                  className={styles.goalSelect}
                  required
                >
                  <option value="">👆 Escolha uma meta</option>
                  {metas.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} ({formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedGoalData && (
              <div className={styles.goalInfo}>
                <div className={styles.goalHeader}>
                  <h4>📊 Informações da Meta</h4>
                  <span className={styles.goalProgress}>
                    {(
                      (selectedGoalData.currentAmount /
                        selectedGoalData.targetAmount) *
                      100
                    ).toFixed(1)}
                    % completa
                  </span>
                </div>

                <div className={styles.goalDetails}>
                  <div className={styles.goalDetail}>
                    <span className={styles.detailLabel}>🎯 Meta:</span>
                    <span className={styles.detailValue}>
                      {selectedGoalData.name}
                    </span>
                  </div>

                  <div className={styles.goalDetail}>
                    <span className={styles.detailLabel}>💰 Valor atual:</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(selectedGoalData.currentAmount)}
                    </span>
                  </div>

                  <div className={styles.goalDetail}>
                    <span className={styles.detailLabel}>🏆 Valor alvo:</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(selectedGoalData.targetAmount)}
                    </span>
                  </div>

                  <div className={styles.goalDetail}>
                    <span className={styles.detailLabel}>📈 Restante:</span>
                    <span
                      className={`${styles.detailValue} ${remainingAmount <= 0 ? styles.completed : ""}`}
                    >
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>

                  {selectedGoalData.deadline && (
                    <div className={styles.goalDetail}>
                      <span className={styles.detailLabel}>📅 Prazo:</span>
                      <span className={styles.detailValue}>
                        {new Date(selectedGoalData.deadline).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(100, (selectedGoalData.currentAmount / selectedGoalData.targetAmount) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label
                htmlFor="amountInput"
                className={styles.formLabel}
                onClick={handleLabelClick}
              >
                💵 Valor a Adicionar
              </label>

              <div className={styles.amountInputWrapper}>
                <span className={styles.currencySymbol}>R$</span>
                <input
                  ref={amountInputRef}
                  type="text"
                  id="amountInput"
                  name="amountInput"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  placeholder="0,00"
                  className={styles.amountInput}
                  autoComplete="off"
                  required
                  disabled={addingAmount}
                  inputMode="decimal"
                />
              </div>

              {selectedGoalData && remainingAmount <= 0 && (
                <div className={styles.metaCompleted}>
                  🎉 Esta meta já foi atingida!
                </div>
              )}

              {formData.amount &&
                selectedGoalData &&
                parseFloat(formData.amount) > remainingAmount &&
                remainingAmount > 0 && (
                  <div className={styles.amountWarning}>
                    ⚠️ Valor excede o restante da meta (máx:{" "}
                    {formatCurrency(remainingAmount)})
                  </div>
                )}
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>❌</span>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={
                  addingAmount ||
                  remainingAmount <= 0 ||
                  !formData.selectedGoal ||
                  !formData.amount
                }
              >
                {addingAmount ? (
                  <>⏳ Adicionando...</>
                ) : (
                  <>💰 Adicionar à Meta</>
                )}
              </button>

              <button
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                disabled={addingAmount}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </BaseModal>
  );
}
