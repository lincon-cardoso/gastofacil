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

export function openCalendar(
  setCalendarOpen: Dispatch<SetStateAction<boolean>>
) {
  setCalendarOpen(true);
}

export function closeCalendar(
  setCalendarOpen: Dispatch<SetStateAction<boolean>>
) {
  setCalendarOpen(false);
}

export async function handleLogout() {
  try {
    // Solicita ao backend para limpar a sessão única no Upstash
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    // Não bloqueia o fluxo de logout do usuário
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao chamar /api/auth/logout", e);
    }
  } finally {
    // Em seguida, invalida a sessão do NextAuth (cookies/JWT)
    signOut({ callbackUrl: "/login" });
  }
}
