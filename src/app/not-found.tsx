import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Página não encontrada</h1>
      <p>O recurso solicitado não existe.</p>
      <Link href="/" style={{ color: "#2563eb" }}>
        Voltar para a página inicial
      </Link>
    </main>
  );
}
