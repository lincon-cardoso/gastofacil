// Utilitário para extrair o ID do usuário de uma sessão
// Tenta buscar o ID em diferentes propriedades possíveis da sessão
export function extractUserId(session: unknown): string | undefined {
  // Verifica se a sessão é um objeto válido
  if (!session || typeof session !== "object") return undefined;
  const s = session as Record<string, unknown>;

  // Tenta buscar em session.user.id
  if ("user" in s) {
    const user = s.user;
    if (user && typeof user === "object") {
      const u = user as Record<string, unknown>;
      if ("id" in u) {
        const id = u.id;
        if (typeof id === "string") return id;
        if (typeof id === "number") return String(id); // Converte número para string
      }
    }
  }

  // Tenta buscar em session.userId
  if ("userId" in s) {
    const id = s.userId;
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
  }

  // Tenta buscar em session.id
  if ("id" in s) {
    const id = s.id;
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
  }

  return undefined; // Retorna undefined se não encontrar o ID
}
