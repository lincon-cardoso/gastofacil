"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  async function handleClick() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignora falha de infraestrutura
    } finally {
      await signOut({ callbackUrl: "/" });
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      Sair
    </button>
  );
}
