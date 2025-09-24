import "@/styles/reset/reset.module.scss";
import type { Metadata } from "next";
import type React from "react";
import { Providers } from "./providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
