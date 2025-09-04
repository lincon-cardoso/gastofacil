"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { ReactElement } from "react";

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
    <header className="gf-header" role="banner">
      {/* Skip link para acessibilidade de teclado */}
      <a className="gf-skip-link" href="#main">
        Pular para o conteúdo
      </a>

      <div className="gf-container">
        <div className="gf-brand">
          <Link href="/" className="gf-logo" aria-label="GastoFácil — Início">
            <Image
              src="/images/imagem.png"
              alt="GastoFácil Logo"
              width={100}
              height={50}
              priority
            />
            <span className="gf-slogan">GastoFácial</span>
          </Link>
        </div>

        <nav className="gf-main-nav" aria-label="Menu principal">
          <ul className="gf-menu">
            {menu.map((item) => (
              <li key={item.href} className="gf-menu-item">
                <Link
                  href={item.href}
                  className={isActive(item.href) ? "gf-is-active" : undefined}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="gf-actions">
          <Link href="/login" className="gf-btn">
            Entrar
          </Link>
          <Link href="/signup" className="gf-btn gf-btn--primary">
            Criar contar
          </Link>
        </div>
      </div>
    </header>
  );
}
