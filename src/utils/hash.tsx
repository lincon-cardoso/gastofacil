// Utilitários de hash executados apenas no servidor.
// Usa import dinâmico para evitar que o bundler inclua dependências nativas no client.

function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("hash utils devem rodar somente no servidor");
  }
}

export async function hashPassword(plain: string): Promise<string> {
  assertServer();

  try {
    const { default: argon2 } = await import("argon2");
    return await argon2.hash(plain);
  } catch (error) {
    console.error("Erro ao gerar hash da senha:", error);
    throw new Error("Falha ao processar senha");
  }
}

export async function verifyPassword(
  hash: string,
  plain: string
): Promise<boolean> {
  assertServer();

  try {
    const { default: argon2 } = await import("argon2");
    return await argon2.verify(hash, plain);
  } catch (error) {
    console.error("Erro ao verificar senha:", error);
    return false;
  }
}
