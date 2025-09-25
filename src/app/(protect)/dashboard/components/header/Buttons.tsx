"use client";
import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import EventIcon from "@mui/icons-material/Event";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import styles from "./Header.module.scss";

type IconName = "Event" | "FilterList" | "Add";

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

function resolveIcon(icon?: IconName | React.ReactNode) {
  if (!icon) return undefined;
  if (typeof icon !== "string") return icon;
  switch (icon) {
    case "Event":
      return <EventIcon />;
    case "FilterList":
      return <FilterListIcon />;
    case "Add":
      return <AddIcon />;
    default:
      return undefined;
  }
}

export default function ActionButtons({
  items,
  children,
  className,
}: ActionButtonsProps) {
  const defaultItems: ActionButtonItem[] = [
    { label: "Setembro/2025", variant: "outlined", startIcon: "Event" },
    { label: "Filtros", variant: "outlined", startIcon: "FilterList" },
    { label: "Nova transação", variant: "contained", startIcon: "Add" },
  ];

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
