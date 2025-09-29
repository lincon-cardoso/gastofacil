"use client";
import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import {
  resolveIcon,
  IconName,
} from "@/app/(protect)/dashboard/components/header/utils/iconResolver";
import styles from "@/app/(protect)/dashboard/components/header/Header.module.scss";

export type ActionButtonItem = {
  key?: string;
  label: string;
  variant?: "text" | "outlined" | "contained";
  startIcon?: IconName | React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

type ActionButtonsProps = {
  items?: ActionButtonItem[];
  children?: React.ReactNode;
  className?: string;
};

const defaultItems: ActionButtonItem[] = [
  { label: "Setembro/2025", variant: "outlined", startIcon: "Event" },
  { label: "Filtros", variant: "outlined", startIcon: "FilterList" },
  { label: "Nova transação", variant: "contained", startIcon: "Add" },
];

export default function ActionButtons({
  items,
  children,
  className,
}: ActionButtonsProps) {
  const toRender = children ? undefined : (items ?? defaultItems);

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      className={className ?? styles.actionButtons}
    >
      {children}
      {toRender &&
        toRender.map((it, idx) => (
          <Button
            key={it.key ?? `${it.label}-${idx}`}
            variant={it.variant ?? "outlined"}
            startIcon={resolveIcon(it.startIcon)}
            onClick={it.onClick}
          >
            {it.label}
          </Button>
        ))}
    </Stack>
  );
}
