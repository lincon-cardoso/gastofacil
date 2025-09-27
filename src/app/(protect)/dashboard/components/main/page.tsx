import { FaArrowUp, FaArrowDown, FaCreditCard } from "react-icons/fa";
import styles from "@/app/(protect)/dashboard/components/main/Main.module.scss";
import Card from "./Card";

export default function Main() {
  return (
    <main>
      <div className={styles.cardGrid}>
        <Card
          title="Saldo Atual"
          value="R$ 18.240,56"
          description="Disponível"
          icon={<FaArrowUp />}
          className={styles.saldoAtual}
        />
        <Card
          title="Receitas"
          value="R$ 36.100,00"
          description="Últimos 6 meses"
          icon={<FaArrowUp />}
          className={styles.receitas}
        />
        <Card
          title="Despesas"
          value="R$ 27.300,00"
          description="Últimos 6 meses"
          icon={<FaArrowDown />}
          className={styles.despesas}
        />
        <Card
          title="Cartões"
          value="R$ 1.980,57"
          description="Próximas faturas"
          icon={<FaCreditCard />}
          className={styles.cartoes}
        />
      </div>
    </main>
  );
}
