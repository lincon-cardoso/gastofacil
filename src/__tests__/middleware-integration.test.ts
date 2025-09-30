import type { Role } from "@prisma/client";

// Simula um cenário completo de teste de sessões
describe("Teste de Integração - Controle de Sessões Simultâneas", () => {
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      set: jest.fn(),
      get: jest.fn(),
      expire: jest.fn(),
    };

    // Reset environment
    process.env.DISABLE_SINGLE_SESSION = "false";
  });

  describe("Cenário Real: Múltiplos Dispositivos", () => {
    it("deve simular usuário tentando acessar de dispositivos diferentes", async () => {
      const user = { id: "user-123", email: "user@example.com" };

      // 1. Usuário faz login no dispositivo 1 (Desktop)
      const desktopToken = {
        sub: user.id,
        jti: "desktop-session-abc123",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValueOnce("OK"); // Primeira sessão registrada
      const desktopResult = await enforceSingleSession(desktopToken, mockRedis);

      expect(desktopResult).toBe(false); // Permitido
      expect(mockRedis.set).toHaveBeenCalledWith(
        `session:${user.id}`,
        "desktop-session-abc123",
        { nx: true, ex: 86400 }
      );

      // 2. Usuário tenta fazer login no dispositivo 2 (Mobile)
      const mobileToken = {
        sub: user.id,
        jti: "mobile-session-xyz789",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValueOnce(null); // Falha (já existe sessão)
      mockRedis.get.mockResolvedValueOnce("desktop-session-abc123"); // Sessão existente diferente

      const mobileResult = await enforceSingleSession(mobileToken, mockRedis);

      expect(mobileResult).toBe(true); // Bloqueado
      expect(mockRedis.get).toHaveBeenCalledWith(`session:${user.id}`);

      // 3. Usuário continua usando dispositivo 1 (renovação de TTL)
      mockRedis.set.mockResolvedValueOnce(null); // Falha (já existe)
      mockRedis.get.mockResolvedValueOnce("desktop-session-abc123"); // Mesmo token

      const desktopContinueResult = await enforceSingleSession(
        desktopToken,
        mockRedis
      );

      expect(desktopContinueResult).toBe(false); // Permitido
      expect(mockRedis.expire).toHaveBeenCalledWith(
        `session:${user.id}`,
        86400
      );
    });

    it("deve permitir login após logout (simulação de nova sessão)", async () => {
      const user = { id: "user-456", email: "user2@example.com" };

      // 1. Primeira sessão
      const firstSession = {
        sub: user.id,
        jti: "session-1-abc",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValueOnce("OK");
      const firstResult = await enforceSingleSession(firstSession, mockRedis);
      expect(firstResult).toBe(false);

      // 2. Simula logout (sessão expira/é removida - não testamos remoção aqui)
      // 3. Nova sessão após logout
      const newSession = {
        sub: user.id,
        jti: "session-2-xyz",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValueOnce("OK"); // Nova sessão registrada com sucesso
      const newResult = await enforceSingleSession(newSession, mockRedis);
      expect(newResult).toBe(false);
    });
  });

  describe("Cenário Real: Falhas de Rede", () => {
    it("deve lidar com falhas intermitentes do Redis", async () => {
      const token = {
        sub: "user-network-test",
        jti: "token-network",
        role: "USER" as Role,
      };

      // 1. Falha na primeira tentativa
      mockRedis.set.mockRejectedValueOnce(new Error("Network timeout"));
      const failureResult = await enforceSingleSession(token, mockRedis);
      expect(failureResult).toBe(false); // Permite acesso em caso de falha

      // 2. Sucesso na segunda tentativa (rede recuperada)
      mockRedis.set.mockResolvedValueOnce("OK");
      const successResult = await enforceSingleSession(token, mockRedis);
      expect(successResult).toBe(false);
    });
  });

  describe("Cenário Real: Configuração Dinâmica", () => {
    it("deve respeitar mudança de configuração em tempo de execução", async () => {
      const token = {
        sub: "user-config-test",
        jti: "token-config",
        role: "USER" as Role,
      };

      // 1. Com controle ativo
      process.env.DISABLE_SINGLE_SESSION = "false";
      mockRedis.set.mockResolvedValueOnce("OK");
      const activeResult = await enforceSingleSession(token, mockRedis);
      expect(activeResult).toBe(false);
      expect(mockRedis.set).toHaveBeenCalled();

      // 2. Desabilitando controle
      process.env.DISABLE_SINGLE_SESSION = "true";
      jest.clearAllMocks();

      const disabledResult = await enforceSingleSession(token, mockRedis);
      expect(disabledResult).toBe(false);
      expect(mockRedis.set).not.toHaveBeenCalled(); // Não deve interagir com Redis
    });
  });

  describe("Cenário Real: Múltiplos Usuários Simultâneos", () => {
    it("deve permitir diferentes usuários logados ao mesmo tempo", async () => {
      const users = [
        { id: "user-1", token: "token-user-1", role: "USER" as Role },
        { id: "user-2", token: "token-user-2", role: "ADMIN" as Role },
        { id: "user-3", token: "token-user-3", role: "USER" as Role },
      ];

      const results = [];

      for (const user of users) {
        const token = {
          sub: user.id,
          jti: user.token,
          role: user.role,
        };

        mockRedis.set.mockResolvedValueOnce("OK"); // Cada usuário pode fazer login
        const result = await enforceSingleSession(token, mockRedis);
        results.push(result);
      }

      // Todos devem ser permitidos
      expect(results).toEqual([false, false, false]);

      // Deve ter criado uma sessão para cada usuário
      expect(mockRedis.set).toHaveBeenCalledTimes(3);
      expect(mockRedis.set).toHaveBeenNthCalledWith(
        1,
        "session:user-1",
        "token-user-1",
        { nx: true, ex: 86400 }
      );
      expect(mockRedis.set).toHaveBeenNthCalledWith(
        2,
        "session:user-2",
        "token-user-2",
        { nx: true, ex: 86400 }
      );
      expect(mockRedis.set).toHaveBeenNthCalledWith(
        3,
        "session:user-3",
        "token-user-3",
        { nx: true, ex: 86400 }
      );
    });
  });

  describe("Cenário Real: Stress Test", () => {
    it("deve lidar com múltiplas tentativas simultâneas do mesmo usuário", async () => {
      const userId = "stress-test-user";
      const tokens = Array.from({ length: 5 }, (_, i) => ({
        sub: userId,
        jti: `token-${i}`,
        role: "USER" as Role,
      }));

      // Primeira tentativa: sucesso
      mockRedis.set.mockResolvedValueOnce("OK");
      const firstResult = await enforceSingleSession(tokens[0], mockRedis);
      expect(firstResult).toBe(false);

      // Outras tentativas: bloqueadas
      for (let i = 1; i < tokens.length; i++) {
        mockRedis.set.mockResolvedValueOnce(null);
        mockRedis.get.mockResolvedValueOnce("token-0"); // Primeira sessão ainda ativa

        const result = await enforceSingleSession(tokens[i], mockRedis);
        expect(result).toBe(true); // Deve ser bloqueado
      }

      expect(mockRedis.set).toHaveBeenCalledTimes(5);
      expect(mockRedis.get).toHaveBeenCalledTimes(4); // 4 verificações de sessão existente
    });
  });
});

// Função auxiliar extraída do middleware para testes isolados
async function enforceSingleSession(
  token: { sub?: string; jti?: string; role?: Role },
  redis: any
): Promise<boolean> {
  const DISABLE_SINGLE_SESSION = process.env.DISABLE_SINGLE_SESSION === "true";
  const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h

  if (DISABLE_SINGLE_SESSION) {
    return false;
  }

  if (!token?.sub || !token?.jti) {
    return false;
  }

  try {
    const sessionKey = `session:${token.sub}`;

    const setResult = await redis.set(sessionKey, token.jti, {
      nx: true,
      ex: SESSION_TTL_SECONDS,
    });

    if (setResult === "OK") {
      return false;
    }

    const current = await redis.get(sessionKey);
    const isDuplicate = !!current && current !== token.jti;

    if (!isDuplicate && current === token.jti) {
      await redis.expire(sessionKey, SESSION_TTL_SECONDS);
    }

    return isDuplicate;
  } catch (error) {
    console.error("[middleware] Erro ao verificar sessão única:", error);
    return false;
  }
}
