"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";
import ActionButtons from "@/app/(protect)/dashboard/components/header/Buttons";
import { signOut } from "next-auth/react";

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  function handleAction() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function openFilters() {
    setFiltersOpen(true);
  }

  function closeFilters() {
    setFiltersOpen(false);
  }

  function openCalendar() {
    setCalendarOpen(true);
  }

  function closeCalendar() {
    setCalendarOpen(false);
  }

  function handleLogout() {
    // Lógica de logout usando next-auth
    signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brandContainer}>
            <Link href="/" className={styles.brandLink}>
              <div className={styles.logoBackground}>
                <Image
                  src="/images/img.png"
                  alt="Logo"
                  width={30}
                  height={30}
                />
              </div>
              <h1 className={styles.title}>GastoFácil</h1>
              <span className={styles.badge}>dashboard</span>
            </Link>
          </div>
          <ActionButtons
            items={[
              {
                label: "Nova transação",
                variant: "contained",
                startIcon: "Add",
                onClick: handleAction,
              },
              {
                label: "Filtros",
                variant: "outlined",
                startIcon: "FilterList",
                onClick: openFilters,
              },
              {
                label: "Calendario",
                variant: "outlined",
                startIcon: "Event",
                onClick: openCalendar,
              },
              {
                label: "Sair",
                variant: "outlined",
                startIcon: "Logout",
                onClick: handleLogout,
              },
            ]}
          />
        </div>
      </header>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2>Modal Aberto</h2>
            </header>
            <div className={styles.modalBody}>
              <form
                className={styles.transactionForm}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="description">Descrição</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Ex: Compra de mercado"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="amount">Valor</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Ex: 150.00"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Categoria</label>
                  <select id="category" name="category" required>
                    <option value="">Selecione</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="lazer">Lazer</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Data</label>
                  <input type="date" id="date" name="date" required />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveButton}>
                    Salvar
                  </button>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
            <footer className={styles.modalActions}>
              <button className={styles.closeButton} onClick={closeModal}>
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}

      {filtersOpen && (
        <div className={styles.modalOverlay} onClick={closeFilters}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2>Filtros</h2>
            </header>
            <div className={styles.modalBody}>
              <form
                className={styles.filtersForm}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="categoryFilter">Categoria</label>
                  <select id="categoryFilter" name="categoryFilter">
                    <option value="">Todas</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="lazer">Lazer</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="dateFilter">Data</label>
                  <input type="date" id="dateFilter" name="dateFilter" />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveButton}>
                    Aplicar
                  </button>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={closeFilters}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {calendarOpen && (
        <div className={styles.modalOverlay} onClick={closeCalendar}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2>Calendário</h2>
            </header>
            <div className={styles.modalBody}>
              <p>
                Insira aqui o componente de calendário ou funcionalidade
                desejada.
              </p>
            </div>
            <footer className={styles.modalActions}>
              <button className={styles.closeButton} onClick={closeCalendar}>
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
