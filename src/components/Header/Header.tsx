"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { data: session, status } = useSession();
  const navItems = [
    { href: "/planos", label: "Planos" },
    { href: "/sobre", label: "Sobre" },
    { href: "/contato", label: "Contato / Suporte" },
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
          <AnimatePresence mode="wait">
            {status === "loading" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden
                style={{ width: 160, height: 36 }}
              />
            ) : session?.user ? (
              <motion.div
                key="logged-in"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/dashboard" className={styles.login}>
                  Dashboard
                </Link>
                <LogoutButton className={styles.signup} />
              </motion.div>
            ) : (
              <motion.div
                key="logged-out"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/login" className={styles.login}>
                  Entrar
                </Link>
                <Link href="/register" className={styles.signup}>
                  Criar conta
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
