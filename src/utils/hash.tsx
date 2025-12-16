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
    // Em alguns ambientes (deploy/serverless) o módulo nativo pode falhar.
    // Fallback para bcryptjs (puro JS) para não bloquear cadastro/login.
    console.error(
      "Erro ao gerar hash com Argon2. Usando fallback bcryptjs.",
      error
    );
    try {
      const bcrypt = await import("bcryptjs");
      // 12 rounds é um equilíbrio razoável para custo/segurança em serverless.
      return await bcrypt.hash(plain, 12);
    } catch (fallbackError) {
      console.error("Erro ao gerar hash com bcryptjs:", fallbackError);
      throw new Error("Falha ao processar senha");
    }
  }
}

// Função para verificar se uma senha bate com o hash armazenado
export async function verifyPassword(
  hash: string,
  plain: string
): Promise<boolean> {
  assertServer(); // Garante que está no servidor

  try {
    // Detecta o algoritmo pelo prefixo do hash para manter compatibilidade.
    if (hash.startsWith("$argon2")) {
      const { default: argon2 } = await import("argon2");
      return await argon2.verify(hash, plain);
    }

    // Bcrypt (ex.: $2a$, $2b$, $2y$)
    if (hash.startsWith("$2")) {
      const bcrypt = await import("bcryptjs");
      return await bcrypt.compare(plain, hash);
    }

    // Fallback: tenta Argon2 e, se falhar, bcryptjs
    try {
      const { default: argon2 } = await import("argon2");
      return await argon2.verify(hash, plain);
    } catch {
      const bcrypt = await import("bcryptjs");
      return await bcrypt.compare(plain, hash);
    }
  } catch (error) {
    console.error("Erro ao verificar senha:", error);
    return false; // Retorna false em caso de erro
  }
}
