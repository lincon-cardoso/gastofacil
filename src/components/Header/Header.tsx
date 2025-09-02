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
