"use client";

import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, useRef } from "react";

function SessionKeepAlive() {
  const { status } = useSession();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Limpa quando desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      // Pinga a cada 5 minutos para renovar TTL (leve, só renova se jti corresponder)
      if (!timerRef.current) {
        // Dispara um ping imediato para renovar logo após a autenticação
        fetch("/api/auth/keep-alive", { method: "GET" }).catch(() => {});
        timerRef.current = window.setInterval(
          () => {
            fetch("/api/auth/keep-alive", { method: "GET" }).catch(() => {});
          },
          5 * 60 * 1000
        ) as unknown as number;
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [status]);

  return null;
}

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <SessionKeepAlive />
      {children}
    </SessionProvider>
  );
}
