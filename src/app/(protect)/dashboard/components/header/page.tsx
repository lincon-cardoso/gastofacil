"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";
import ActionButtons from "@/app/(protect)/dashboard/components/header/Buttons";
import {
  handleAction,
  openFilters,
  openCalendar,
  handleLogout,
} from "./headerFunctions";
import Modals from "./Modals";

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

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
                onClick: () => handleAction(setModalOpen),
              },
              {
                label: "Filtros",
                variant: "outlined",
                startIcon: "FilterList",
                onClick: () => openFilters(setFiltersOpen),
              },
              {
                label: "Calendario",
                variant: "outlined",
                startIcon: "Event",
                onClick: () => openCalendar(setCalendarOpen),
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

      <Modals
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
      />
    </>
  );
}
