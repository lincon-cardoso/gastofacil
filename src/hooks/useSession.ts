// Hook customizado para gerenciar dados da sessão do usuário usando SWR
import useSWR from "swr";

// Tipo que define a estrutura dos dados da sessão
type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  orcamentos: Array<{
    categoria: string;
    utilizado: number;
    total: number;
  }>;
  metas: Array<{
    categoria: string;
    utilizado: number;
    total: number;
  }>;
};

// Função fetcher para requisições HTTP usada pelo SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook que retorna dados da sessão com cache e revalidação automática
export const useSessionData = () => {
  const { data, error, isLoading, mutate } = useSWR<SessionData>(
    "/api/session", // Endpoint da API
    fetcher // Função para fazer a requisição
  );

  return {
    session: data, // Dados da sessão
    isLoading, // Estado de carregamento
    isError: error, // Estado de erro
    mutate, // Função para revalidar os dados manualmente
  };
};
