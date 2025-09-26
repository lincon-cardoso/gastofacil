"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  async function handleClick() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        // Garante envio de cookies da sessão e evita cancelamento em navegação
        credentials: "include",
        cache: "no-store",
        // Mantém a requisição mesmo que haja navegação após o clique
        keepalive: true,
      });
    } catch {
      // ignora falha de infraestrutura
    } finally {
      // Evita navegação automática antes do POST concluir
      await signOut({ redirect: false });
      router.push("/");
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      Sair
    </button>
  );
}
