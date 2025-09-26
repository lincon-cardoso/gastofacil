// Utilitários de hash executados apenas no servidor.
// Usa import dinâmico para evitar que o bundler inclua dependências nativas no client.

function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("hash utils devem rodar somente no servidor");
  }
}

export async function hashPassword(plain: string) {
  assertServer();
  const { default: argon2 } = await import("argon2");
  return argon2.hash(plain);
}

export async function verifyPassword(hash: string, plain: string) {
  assertServer();
  const { default: argon2 } = await import("argon2");
  return argon2.verify(hash, plain);
}
