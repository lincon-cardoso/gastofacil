import { Dispatch, SetStateAction } from "react";
import { signOut } from "next-auth/react";

export function handleAction(setModalOpen: Dispatch<SetStateAction<boolean>>) {
  setModalOpen(true);
}

export function closeModal(setModalOpen: Dispatch<SetStateAction<boolean>>) {
  setModalOpen(false);
}

export function openFilters(setFiltersOpen: Dispatch<SetStateAction<boolean>>) {
  setFiltersOpen(true);
}

export function closeFilters(
  setFiltersOpen: Dispatch<SetStateAction<boolean>>
) {
  setFiltersOpen(false);
}

export async function handleLogout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      keepalive: true,
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao chamar /api/auth/logout", e);
    }
  } finally {
    signOut({ callbackUrl: "/login" });
  }
}
