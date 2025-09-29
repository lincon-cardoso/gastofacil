"use client";
import React from "react";
import BaseModal from "./BaseModal";
import styles from "../Modal.module.scss";
import { useSession } from "next-auth/react";
import { useSessionSWR } from "@/hooks/useSessionSWR";

export type UserPlan = string | { name: string } | null;

type Props = { open: boolean; onClose: () => void };

export default function ProfileModal({ open, onClose }: Props) {
  const { data: sessionFromNextAuth } = useSession();
  const { session: sessionFromSWR } = useSessionSWR();
  const session = sessionFromSWR ?? sessionFromNextAuth ?? null;

  const getPlanName = (plan: UserPlan | undefined): string => {
    if (!plan) return "Básico";
    if (typeof plan === "string") return plan;
    return plan.name || "Básico";
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Perfil"
      ariaLabelledBy="profile-title"
    >
      <div className={styles.modalBody}>
        {session?.user ? (
          <div>
            <p>Nome: {session.user.name || "Usuário"}</p>
            <p>Email: {session.user.email || "Email não disponível"}</p>
            <p>Plano: {getPlanName(session.user.plan)}</p>
          </div>
        ) : (
          <p>Bem-vindo ao seu perfil!</p>
        )}
      </div>
      <footer className={styles.modalActions}>
        <button className={styles.closeButton} onClick={onClose}>
          Fechar
        </button>
      </footer>
    </BaseModal>
  );
}
