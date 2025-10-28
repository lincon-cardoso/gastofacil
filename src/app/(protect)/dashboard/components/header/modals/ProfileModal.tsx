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
    if (!plan) return "Free";
    if (typeof plan === "string") return plan;
    return plan.name || "Free";
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
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>
                Informações Pessoais
              </h4>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Nome:</strong> {session.user.name || "Usuário"}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Email:</strong>{" "}
                {session.user.email || "Email não disponível"}
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>
                Plano Atual
              </h4>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Plano:</strong> {getPlanName(session.user.plan)}
              </p>

              {getPlanName(session.user.plan) === "Free" && (
                <p
                  style={{
                    margin: "0.5rem 0",
                    padding: "0.5rem",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                >
                  💡 Você está no plano gratuito. Faça upgrade para acessar
                  recursos premium!
                </p>
              )}
            </div>
          </div>
        ) : (
          <p>Bem-vindo ao seu perfil!</p>
        )}
      </div>
      <footer className={styles.modalActions}>
        {session?.user && getPlanName(session.user.plan) === "Free" && (
          <button
            className={styles.upgradeButton}
            onClick={() => {
              onClose();
              window.location.href = "/planos";
            }}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "0.5rem",
            }}
          >
            Fazer Upgrade
          </button>
        )}
        <button className={styles.closeButton} onClick={onClose}>
          Fechar
        </button>
      </footer>
    </BaseModal>
  );
}
