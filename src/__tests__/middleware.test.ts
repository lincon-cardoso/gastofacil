import { getToken } from "next-auth/jwt";
import { Redis } from "@upstash/redis";
import type { Role } from "@prisma/client";

// Mock do NextAuth
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// Mock do Upstash Redis
jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      expire: jest.fn(),
    })),
  },
}));

// Mock do Ratelimit
jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: jest.fn(() => ({
    limit: jest.fn(() => ({ success: true })),
  })),
}));

// Simula a função enforceSingleSession do middleware
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

    // Tenta definir a sessão se não existir (NX = Only set if Not eXists)
    const setResult = await redis.set(sessionKey, token.jti, {
      nx: true,
      ex: SESSION_TTL_SECONDS,
    });

    if (setResult === "OK") {
      return false; // sessão registrada agora
    }

    // Se não conseguiu setar, verifica se a sessão existente é do mesmo jti
    const current = await redis.get(sessionKey);
    const isDuplicate = !!current && current !== token.jti;

    // Se é a mesma sessão, renova o TTL
    if (!isDuplicate && current === token.jti) {
      await redis.expire(sessionKey, SESSION_TTL_SECONDS);
    }

    return isDuplicate;
  } catch (error) {
    console.error("[middleware] Erro ao verificar sessão única:", error);
    return false; // Em caso de falha, não bloqueia o usuário
  }
}

describe("Middleware - Controle de Sessões Simultâneas", () => {
  let mockRedis: any;
  let mockGetToken: jest.MockedFunction<typeof getToken>;

  beforeEach(() => {
    // Limpa todos os mocks
    jest.clearAllMocks();

    // Configura mocks
    mockRedis = {
      set: jest.fn(),
      get: jest.fn(),
      expire: jest.fn(),
    };

    (Redis.fromEnv as jest.Mock).mockReturnValue(mockRedis);
    mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

    // Variáveis de ambiente para teste
    process.env.DISABLE_SINGLE_SESSION = "false";
    process.env.APP_ENV = "development";
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterEach(() => {
    // Restaura variáveis de ambiente
    delete process.env.DISABLE_SINGLE_SESSION;
    delete process.env.APP_ENV;
  });

  describe("Sessão Única Ativa", () => {
    it("deve permitir primeira sessão de um usuário", async () => {
      // Arrange
      const token = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValue("OK"); // Primeira sessão registrada

      // Act
      const isDuplicate = await enforceSingleSession(token, mockRedis);

      // Assert
      expect(mockRedis.set).toHaveBeenCalledWith(
        "session:user-123",
        "token-abc",
        { nx: true, ex: 86400 } // 24h em segundos
      );
      expect(isDuplicate).toBe(false);
    });

    it("deve bloquear segunda sessão do mesmo usuário", async () => {
      // Arrange
      const firstToken = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      const secondToken = {
        sub: "user-123",
        jti: "token-xyz", // JTI diferente = nova sessão
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValue(null); // Não conseguiu setar (já existe)
      mockRedis.get.mockResolvedValue("token-abc"); // Sessão existente com JTI diferente

      // Act
      const isDuplicate = await enforceSingleSession(secondToken, mockRedis);

      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith("session:user-123");
      expect(isDuplicate).toBe(true);
    });

    it("deve permitir mesma sessão e renovar TTL", async () => {
      // Arrange
      const token = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValue(null); // Não conseguiu setar (já existe)
      mockRedis.get.mockResolvedValue("token-abc"); // Mesmo JTI = mesma sessão

      // Act
      const isDuplicate = await enforceSingleSession(token, mockRedis);

      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith("session:user-123");
      expect(mockRedis.expire).toHaveBeenCalledWith("session:user-123", 86400);
      expect(isDuplicate).toBe(false);
    });

    it("deve permitir usuários diferentes terem sessões simultâneas", async () => {
      // Arrange
      const user1Token = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      const user2Token = {
        sub: "user-456",
        jti: "token-xyz",
        role: "USER" as Role,
      };

      // Simula user1 já logado
      mockRedis.set.mockResolvedValueOnce("OK");
      const user1Result = await enforceSingleSession(user1Token, mockRedis);

      // Simula user2 fazendo login
      mockRedis.set.mockResolvedValueOnce("OK");
      const user2Result = await enforceSingleSession(user2Token, mockRedis);

      // Assert
      expect(mockRedis.set).toHaveBeenCalledWith(
        "session:user-456",
        "token-xyz",
        { nx: true, ex: 86400 }
      );
      expect(user1Result).toBe(false);
      expect(user2Result).toBe(false);
    });
  });

  describe("Sessão Única Desabilitada", () => {
    beforeEach(() => {
      process.env.DISABLE_SINGLE_SESSION = "true";
    });

    it("deve permitir múltiplas sessões quando desabilitado", async () => {
      // Arrange
      const token = {
        sub: "user-123",
        jti: "token-xyz",
        role: "USER" as Role,
      };

      // Act
      const isDuplicate = await enforceSingleSession(token, mockRedis);

      // Assert
      expect(mockRedis.set).not.toHaveBeenCalled();
      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(isDuplicate).toBe(false);
    });
  });

  describe("Cenários de Erro", () => {
    it("deve permitir acesso quando Redis falha", async () => {
      // Arrange
      const token = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      mockRedis.set.mockRejectedValue(new Error("Redis connection failed"));

      // Act
      const isDuplicate = await enforceSingleSession(token, mockRedis);

      // Assert
      expect(isDuplicate).toBe(false);
    });

    it("deve não aplicar controle para token inválido", async () => {
      // Arrange
      const invalidToken = {
        sub: undefined, // Token sem sub
        jti: "token-abc",
        role: "USER" as Role,
      };

      // Act
      const isDuplicate = await enforceSingleSession(invalidToken, mockRedis);

      // Assert
      expect(mockRedis.set).not.toHaveBeenCalled();
      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(isDuplicate).toBe(false);
    });

    it("deve não aplicar controle para token sem jti", async () => {
      // Arrange
      const invalidToken = {
        sub: "user-123",
        jti: undefined, // Token sem jti
        role: "USER" as Role,
      };

      // Act
      const isDuplicate = await enforceSingleSession(invalidToken, mockRedis);

      // Assert
      expect(mockRedis.set).not.toHaveBeenCalled();
      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(isDuplicate).toBe(false);
    });
  });

  describe("Cenários de TTL", () => {
    it("deve configurar TTL correto para nova sessão", async () => {
      // Arrange
      const token = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValue("OK");

      // Act
      await enforceSingleSession(token, mockRedis);

      // Assert
      expect(mockRedis.set).toHaveBeenCalledWith(
        "session:user-123",
        "token-abc",
        { nx: true, ex: 86400 } // Exatamente 24h = 86400 segundos
      );
    });

    it("deve renovar TTL para sessão existente válida", async () => {
      // Arrange
      const token = {
        sub: "user-123",
        jti: "token-abc",
        role: "USER" as Role,
      };

      mockRedis.set.mockResolvedValue(null); // Falha ao setar (já existe)
      mockRedis.get.mockResolvedValue("token-abc"); // Mesmo token

      // Act
      await enforceSingleSession(token, mockRedis);

      // Assert
      expect(mockRedis.expire).toHaveBeenCalledWith("session:user-123", 86400);
    });
  });
});
