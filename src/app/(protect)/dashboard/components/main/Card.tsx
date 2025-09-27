import { ReactNode } from "react";
import styles from "@/app/(protect)/dashboard/components/main/Main.module.scss";

interface CardProps {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode; // Ícone opcional
  className?: string;
}

export default function Card({
  title,
  value,
  description,
  icon,
  className,
}: CardProps) {
  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.cardContent}>
        <div className={styles.textContent}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.value}>{value}</p>
          <p className={styles.description}>{description}</p>
        </div>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
    </div>
  );
}
