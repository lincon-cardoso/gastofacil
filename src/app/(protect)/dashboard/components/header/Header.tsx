"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";
import ActionButtons from "@/app/(protect)/dashboard/components/header/ui/ActionButtons";
import {
  handleAction,
  openFilters,
  handleLogout,
} from "@/app/(protect)/dashboard/components/header/utils/headerFunctions";
import Modals from "@/app/(protect)/dashboard/components/header/modals/Modals";
import CreateMenu from "@/app/(protect)/dashboard/components/header/ui/CreateMenu";

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createMonthlyBudgetOpen, setCreateMonthlyBudgetOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brandContainer}>
            <Link href="/dashboard" className={styles.brandLink}>
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
                onClick: () => handleAction(setModalOpen),
              },
              {
                label: "Filtros",
                variant: "outlined",
                startIcon: "FilterList",
                onClick: () => openFilters(setFiltersOpen),
              },
              {
                label: "Perfil",
                variant: "text",
                startIcon: "AccountCircle",
                onClick: () => setProfileModalOpen(true),
              },
              {
                label: "Sair",
                variant: "outlined",
                startIcon: "Logout",
                onClick: handleLogout,
              },
            ]}
          />
          <CreateMenu
            onCreateGoal={() => setCreateGoalOpen(true)}
            onAddCard={() => setAddCardOpen(true)}
            onCreateMonthlyBudget={() => setCreateMonthlyBudgetOpen(true)}
          />
        </div>
      </header>

      <Modals
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        addCardOpen={addCardOpen}
        setAddCardOpen={setAddCardOpen}
        createGoalOpen={createGoalOpen}
        setCreateGoalOpen={setCreateGoalOpen}
        profileModalOpen={profileModalOpen}
        setProfileModalOpen={setProfileModalOpen}
        createMonthlyBudgetOpen={createMonthlyBudgetOpen}
        setCreateMonthlyBudgetOpen={setCreateMonthlyBudgetOpen}
      />
    </>
  );
}
