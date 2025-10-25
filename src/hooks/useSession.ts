import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useSessionData = () => {
  const { data, error, isLoading, mutate } = useSWR<SessionData>(
    "/api/session",
    fetcher
  );

  return {
    session: data,
    isLoading,
    isError: error,
    mutate,
  };
};
