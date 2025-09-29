"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Algo deu errado!</h2>
      <p>Erro: {error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
