import "../styles/globals.scss";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "GastoFácil - Gerenciador Contas",
  description:
    "Gerencie seus gastos de forma fácil e eficiente com o GastoFácil.",
  icons: {
    icon: "/favicons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
