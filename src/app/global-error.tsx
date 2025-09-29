"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Algo deu errado!</h2>
        <p>Erro: {error.message}</p>
        <button onClick={() => reset()}>Tentar novamente</button>
      </body>
    </html>
  );
}
