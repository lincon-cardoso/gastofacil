import "../styles/globals.scss"; // Importa os estilos globais

export const metadata = {
  title: "GastoFácil - Gerenciador Contas",
  description:
    "Gerencie seus gastos de forma fácil e eficiente com o GastoFácil.",
  icons: {
    icon: "/favicons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
