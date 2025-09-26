import "../styles/globals.scss";
import type { Metadata } from "next";
import type React from "react";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

export const metadata: Metadata = {
  title: "GastoFácil - Gerenciador Contas",
  description:
    "Gerencie seus gastos de forma fácil e eficiente com o GastoFácil.",
  icons: {
    icon: "/favicons/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
