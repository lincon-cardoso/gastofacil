"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { ReactElement } from "react";
import { Disclosure } from "@headlessui/react";

interface NavItem {
  label: string;
  href: string;
}

export function Header(): ReactElement {
  const pathname = usePathname();

  const normalizePath = (p?: string): string => {
    const base = (p ?? "/").split(/[?#]/)[0];
    if (base === "/") return "/";
    return base.replace(/\/+$|\s+/g, "").replace(/\/$/, "") || "/";
  };

  const current = useMemo(() => normalizePath(pathname), [pathname]);

  const menu: NavItem[] = useMemo(
    () => [
      { label: "Funcionalidades", href: "/features" },
      { label: "Planilhas", href: "/sheets" },
      { label: "Objetivos", href: "/goals" },
      { label: "Blog", href: "/blog" },
      { label: "Suporte", href: "/support" },      
    ],
    []
  );

  const isActive = (href: string): boolean => {
    const h = normalizePath(href);
    if (h === "/") return current === "/";
    return current === h || current.startsWith(h + "/");
  };

  return (
    <header className="header" role="banner">
      {/* Skip link para acessibilidade de teclado */}
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>

      <div className="container">
        <div className="brand">
          <Link href="/" className="logo" aria-label="GastoFácil — Início">
            <Image
              src="/images/imagem.png"
              alt="GastoFácil Logo"
              width={100}
              height={50}
              priority
            />
            <span className="slogan">GastoFácial</span>
          </Link>
        </div>

        <nav className="nav" aria-label="Menu principal">
          <ul className="menu">
            {menu.map((item) => (
              <li key={item.href} className="menuItem">
                <Link
                  href={item.href}
                  className={isActive(item.href) ? "active" : undefined}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="actions">
          <Link href="/login" className="btn">
            Entrar
          </Link>
          <Link href="/signup" className="btn primary">
            Criar contar
          </Link>
        </div>

      </div>
    </header>
  );
}
