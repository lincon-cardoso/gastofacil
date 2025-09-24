import Image from "next/image";
import Link from "next/link"; // Importando o componente Link do Next.js
import styles from "./Header.module.scss";

export default function Header() {
  const navItems = [
    { href: "/planos", label: "Planos" },
    { href: "/sobre", label: "Sobre" }, // Novo item
    { href: "/contato", label: "Contato / Suporte" }, // Novo item
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brandContainer}>
          <Link href="/" className={styles.brandLink}>
            <div className={styles.logoBackground}>
              <Image src="/images/img.png" alt="Logo" width={30} height={30} />
            </div>
            <h1 className={styles.title}>GastoFácil</h1>
            <span className={styles.badge}>beta</span>
          </Link>
        </div>
        <nav className={styles.nav} aria-label="Navegação principal">
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.auth}>
          <Link href="/login" className={styles.login}>
            Entrar
          </Link>
          <Link href="/register" className={styles.signup}>
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
