"use client";
import React from "react";
import TransactionModal from "./TransactionModal";
import AddCardModal from "./AddCardModal";
import CreateGoalModal from "./CreateGoalModal";
import ProfileModal from "./ProfileModal";
import CreateMonthlyBudgetModal from "./CreateMonthlyBudgetModal";
import CreateCategoryModal from "./CreateCategoryModal";
import AddToGoalsModal from "./AddToGoalsModal";

type ModalsProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addToGoalsOpen: boolean;
  setAddToGoalsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addCardOpen?: boolean;
  setAddCardOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  createGoalOpen?: boolean;
  setCreateGoalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  profileModalOpen?: boolean;
  setProfileModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  createMonthlyBudgetOpen?: boolean;
  setCreateMonthlyBudgetOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  createCategoryOpen?: boolean;
  setCreateCategoryOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modals({
  modalOpen,
  setModalOpen,
  addToGoalsOpen,
  setAddToGoalsOpen,
  addCardOpen,
  setAddCardOpen,
  createGoalOpen,
  setCreateGoalOpen,
  profileModalOpen,
  setProfileModalOpen,
  createMonthlyBudgetOpen,
  setCreateMonthlyBudgetOpen,
  createCategoryOpen,
  setCreateCategoryOpen,
}: ModalsProps) {
  return (
    <>
      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AddToGoalsModal
        open={addToGoalsOpen}
        onClose={() => setAddToGoalsOpen(false)}
      />

      <AddCardModal
        isOpen={!!addCardOpen}
        onClose={() => setAddCardOpen?.(false)}
      />

      <CreateGoalModal
        isOpen={!!createGoalOpen}
        onClose={() => setCreateGoalOpen?.(false)}
      />

      <CreateMonthlyBudgetModal
        isOpen={!!createMonthlyBudgetOpen}
        onClose={() => setCreateMonthlyBudgetOpen?.(false)}
      />
      <ProfileModal
        open={!!profileModalOpen}
        onClose={() => setProfileModalOpen?.(false)}
      />
      <CreateCategoryModal
        isOpen={!!createCategoryOpen}
        onClose={() => setCreateCategoryOpen?.(false)}
      />
    </>
  );
}
