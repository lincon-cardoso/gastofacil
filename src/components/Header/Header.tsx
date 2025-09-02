import Link from "next/link";

export function Header() {
  return (
    <header className="header" role="banner">
      <div className="container">
        <Link href="/" className="logo" aria-label="GastoFácil - Início">
          <span className="brand">GastoFácil</span>
        </Link>

        <nav className="nav" aria-label="Navegação principal">
          <Link href="/" className="link">
            Início
          </Link>
          <Link href="/contas" className="link">
            Contas
          </Link>
          <Link href="/relatorios" className="link">
            Relatórios
          </Link>
        </nav>

        <div className="actions">
          <button className="cta" type="button">
            Adicionar gasto
          </button>
          <button className="profile" aria-label="Perfil">
            JD
          </button>
        </div>
      </div>
    </header>
  );
}

// export default removed to prefer named exports
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const menu = [
    { label: "Funcionalidades", href: "/features" },
    { label: "Planilhas", href: "/sheets" },
    { label: "Objetivos", href: "/goals" },
    { label: "Blog", href: "/blog" },
    { label: "Suporte", href: "/support" },
  ];

  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="brand">
          <Link href="/" className="logo" aria-label="GastoFácil - Início">
            {/* Use apenas o PNG público para evitar requisições a .webp inexistente (causando 303). */}
            <Image
              src="/images/imagem.png"
              alt="GastoFácil Logo"
              width={100}
              height={50}
            />
            <span className="slogan">GastoFácil</span>
          </Link>
        </div>

        <nav className="nav" aria-label="Menu principal">
          <ul className="menu">
            {menu.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/"));

              return (
                <li key={item.label} className="menuItem">
                  <Link
                    href={item.href}
                    className={isActive ? "active" : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="actions">
          <Link href="/login" className="btn">
            Entrar
          </Link>
          <Link href="/signup" className="btn primary">
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}

// export default removed to prefer named exports
