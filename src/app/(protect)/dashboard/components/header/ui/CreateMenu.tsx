"use client";
import React, { useEffect, useRef, useState } from "react";
import FlagIcon from "@mui/icons-material/Flag";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BudgetIcon from "@mui/icons-material/AccountBalanceWallet";
import CategoryIcon from "@mui/icons-material/Category";
import styles from "../CreateMenu.module.scss";

type CreateMenuProps = {
  onCreateGoal?: () => void;
  onAddCard?: () => void;
  onCreateMonthlyBudget?: () => void;
  onCreateCategory?: () => void;
  className?: string;
};

type MenuItem = {
  id: string;
  label: string;
  actionKey:
    | "createGoal"
    | "addCard"
    | "createMonthlyBudget"
    | "createCategory";
  icon: React.ReactNode;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "create-goal",
    label: "Meta",
    actionKey: "createGoal",
    icon: <FlagIcon fontSize="small" />,
  },
  {
    id: "add-card",
    label: "Cartão",
    actionKey: "addCard",
    icon: <CreditCardIcon fontSize="small" />,
  },
  {
    id: "createMonthlyBudget",
    label: "Orçamento do Mês",
    actionKey: "createMonthlyBudget",
    icon: <BudgetIcon fontSize="small" />,
  },
  {
    id: "create-category",
    label: "Categoria",
    actionKey: "createCategory",
    icon: <CategoryIcon fontSize="small" />,
  },
];

export default function CreateMenu({
  onCreateGoal,
  onAddCard,
  onCreateMonthlyBudget,
  onCreateCategory,

  className,
}: CreateMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((v) => !v);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => itemsRef.current[0]?.focus());
    }
  }, [isOpen]);

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = itemsRef.current.findIndex(
      (el) => el === document.activeElement
    );
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % itemsRef.current.length;
      itemsRef.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev =
        (idx - 1 + itemsRef.current.length) % itemsRef.current.length;
      itemsRef.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      itemsRef.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      itemsRef.current[itemsRef.current.length - 1]?.focus();
    }
  };

  const handleItemClick = (
    key: "createGoal" | "addCard" | "createMonthlyBudget" | "createCategory"
  ) => {
    if (key === "createGoal") onCreateGoal?.();
    if (key === "addCard") onAddCard?.();
    if (key === "createMonthlyBudget") onCreateMonthlyBudget?.();
    if (key === "createCategory") onCreateCategory?.();
    closeMenu();
    buttonRef.current?.focus();
  };

  return (
    <div className={`${styles.dropdownContainer} ${className ?? ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.dropdownButton}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="create-menu"
        onClick={toggleMenu}
        onKeyDown={onButtonKeyDown}
      >
        Criar
        <span aria-hidden>▾</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="create-menu"
          role="menu"
          aria-label="Ações de criação"
          className={styles.dropdownList}
          onKeyDown={onMenuKeyDown}
        >
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              role="menuitem"
              type="button"
              className={styles.listButton}
              onClick={() => handleItemClick(item.actionKey)}
            >
              <span className={styles.listIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
