// Utilitários de hash executados apenas no servidor.
// Usa import dinâmico para evitar que o bundler inclua dependências nativas no client.

// Função que garante que o código está rodando no servidor
function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("hash utils devem rodar somente no servidor");
  }
}

// Função para criar hash seguro da senha usando Argon2
export async function hashPassword(plain: string): Promise<string> {
  assertServer(); // Garante que está no servidor

  try {
    // Import dinâmico para evitar problemas no client-side
    const { default: argon2 } = await import("argon2");
    return await argon2.hash(plain); // Retorna o hash da senha
  } catch (error) {
    console.error("Erro ao gerar hash da senha:", error);
    throw new Error("Falha ao processar senha");
  }
}

// Função para verificar se uma senha bate com o hash armazenado
export async function verifyPassword(
  hash: string,
  plain: string
): Promise<boolean> {
  assertServer(); // Garante que está no servidor

  try {
    // Import dinâmico para evitar problemas no client-side
    const { default: argon2 } = await import("argon2");
    return await argon2.verify(hash, plain); // Retorna true se a senha estiver correta
  } catch (error) {
    console.error("Erro ao verificar senha:", error);
    return false; // Retorna false em caso de erro
  }
}
