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

export default function Main() {
  return (
    <main>
      <div className={styles.dashboardContainer}>
        <div className={styles.cardGrid}>
          <Card
            title="Saldo Atual"
            value="R$ 18.240,00"
            description="Disponível"
            icon={<GoGraph />}
            className={styles.saldoAtual}
          />
          <Card
            title="Receitas"
            value="R$ 30.100,00"
            description="Últimos 6 meses"
            icon={<GoArrowUpRight />}
            className={styles.receitas}
          />
          <Card
            title="Despesas"
            value="R$ 27.300,00"
            description="Últimos 6 meses"
            icon={<GoArrowDownRight />}
            className={styles.despesas}
          />
          <Card
            title="Cartões"
            value="R$ 1.980,57"
            description="Próximas faturas"
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
        </div>
      </div>
    </main>
  );
}
