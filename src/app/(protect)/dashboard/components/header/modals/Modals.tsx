"use client";
import React from "react";
import TransactionModal from "./TransactionModal";
import FiltersModal from "./FiltersModal";
import AddCardModal from "./AddCardModal";
import CreateGoalModal from "./CreateGoalModal";
import ProfileModal from "./ProfileModal";
import CreateMonthlyBudgetModal from "./CreateMonthlyBudgetModal";

type ModalsProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addCardOpen?: boolean;
  setAddCardOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  createGoalOpen?: boolean;
  setCreateGoalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  profileModalOpen?: boolean;
  setProfileModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  createMonthlyBudgetOpen?: boolean;
  setCreateMonthlyBudgetOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modals({
  modalOpen,
  setModalOpen,
  filtersOpen,
  setFiltersOpen,
  addCardOpen,
  setAddCardOpen,
  createGoalOpen,
  setCreateGoalOpen,
  profileModalOpen,
  setProfileModalOpen,
  createMonthlyBudgetOpen,
  setCreateMonthlyBudgetOpen,
}: ModalsProps) {
  return (
    <>
      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <AddCardModal
        open={!!addCardOpen}
        onClose={() => setAddCardOpen?.(false)}
      />
      <CreateGoalModal
        open={!!createGoalOpen}
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
    </>
  );
}
