"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import styles from "./Header.module.scss";
import ActionButtons from "@/app/(protect)/dashboard/components/header/ui/ActionButtons";
import {
  handleAction,
  handleAddToGoals,
  handleLogout,
} from "@/app/(protect)/dashboard/components/header/utils/headerFunctions";
import Modals from "@/app/(protect)/dashboard/components/header/modals/Modals";
import CreateMenu from "@/app/(protect)/dashboard/components/header/ui/CreateMenu";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const [addToGoalsOpen, setAddToGoalsOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createMonthlyBudgetOpen, setCreateMonthlyBudgetOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(true);

  // Hook para detectar se a tela é 708px ou menor
  const isMobile = useMediaQuery("(max-width: 708px)");

  // Reset do estado quando muda de mobile para desktop e vice-versa
  useEffect(() => {
    if (!isMobile) {
      setActionsVisible(true); // Sempre mostra os botões em telas maiores que 708px
    }
  }, [isMobile]);

  // Determina se deve mostrar os ActionButtons
  const shouldShowActions = !isMobile || actionsVisible;

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

            {/* Botão Toggle ao lado da marca */}
            <div className={styles.toggleContainer}>
              <IconButton
                onClick={() => setActionsVisible(!actionsVisible)}
                className={styles.toggleButton}
                size="small"
              >
                {actionsVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </div>
          </div>

          {/* ActionButtons com visibilidade condicional */}
          {shouldShowActions && (
            <ActionButtons
              items={[
                {
                  label: "Nova transação",
                  variant: "contained",
                  startIcon: "Add",
                  onClick: () => handleAction(setModalOpen),
                },
                {
                  label: "Adicionar às Metas",
                  variant: "outlined",
                  startIcon: "Savings",
                  onClick: () => handleAddToGoals(setAddToGoalsOpen),
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
          )}

          <CreateMenu
            onCreateGoal={() => setCreateGoalOpen(true)}
            onAddCard={() => setAddCardOpen(true)}
            onCreateMonthlyBudget={() => setCreateMonthlyBudgetOpen(true)}
            onCreateCategory={() => setCreateCategoryOpen(true)}
          />
        </div>
      </header>

      <Modals
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        addToGoalsOpen={addToGoalsOpen}
        setAddToGoalsOpen={setAddToGoalsOpen}
        addCardOpen={addCardOpen}
        setAddCardOpen={setAddCardOpen}
        createGoalOpen={createGoalOpen}
        setCreateGoalOpen={setCreateGoalOpen}
        profileModalOpen={profileModalOpen}
        setProfileModalOpen={setProfileModalOpen}
        createMonthlyBudgetOpen={createMonthlyBudgetOpen}
        setCreateMonthlyBudgetOpen={setCreateMonthlyBudgetOpen}
        createCategoryOpen={createCategoryOpen}
        setCreateCategoryOpen={setCreateCategoryOpen}
      />
    </>
  );
}
