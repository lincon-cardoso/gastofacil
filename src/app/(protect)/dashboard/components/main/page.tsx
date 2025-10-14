"use client";

import {
  GoGraph,
  GoArrowUpRight,
  GoArrowDownRight,
  GoCreditCard,
} from "react-icons/go";
import styles from "@/app/(protect)/dashboard/components/main/Main.module.scss";
import Card from "./components/Cards/Card";
import Charts from "./components/Charts/Charts";
import Orcamento from "./components/Orcamento/page";
import Transacoes from "./components/Transacoes/page";
import MetasPage from "./components/Metas/page";
import Footer from "@/app/(protect)/dashboard/components/Footer/page";
import { useUserData } from "@/hooks/useUserData";

export default function Main() {
  // Hook com dados unificados do dashboard
  const {
    session,
    isLoading,
    isError,
    totalReceita,
    totalTransacoes,
    saldoAtual,
    totalOrcamentoCartao,
  } = useUserData();

  // Estados de carregamento e erro
  if (isLoading)
    return <div className={styles.loading}>Carregando dados...</div>;
  if (isError || !session) {
    return (
      <div className={styles.error}>
        Erro ao carregar dados ou usuário não autenticado.
      </div>
    );
  }

  return (
    <main>
      <div className={styles.dashboardContainer}>
        <div className={styles.cardGrid}>
          {/* Card de saldo atual - receitas menos despesas */}
          <Card
            title="Saldo Atual"
            value={`R$ ${(saldoAtual).toFixed(2)}`}
            description={"Saldo disponível"}
            icon={<GoGraph />}
            className={styles.saldoAtual}
          />
          {/* Card de receitas - transações positivas */}
          <Card
            title="Receitas"
            value={`R$ ${totalReceita.toFixed(2)}`}
            description="Total recebido"
            icon={<GoArrowUpRight />}
            className={styles.receitas}
          />
          {/* Card de despesas - transações negativas */}
          <Card
            title="Despesas"
            value={`R$ ${totalTransacoes.toFixed(2)}`}
            description="Total gasto"
            icon={<GoArrowDownRight />}
            className={styles.despesas}
          />
          {/* Card de orçamentos - limites planejados */}
          <Card
            title="Total Faturas de cartões"
            value={`R$ ${totalOrcamentoCartao.toFixed(2)}`}
            description="Total planejado"
            icon={<GoCreditCard />}
            className={styles.cartoes}
          />
        </div>
      </div>
      <div className={styles.chartsWrapper}>
        <div className={styles.chartsContainer}>
          <Charts />
          <Orcamento />
          <Transacoes />
          <MetasPage />
          <Footer />
        </div>
      </div>
    </main>
  );
}
