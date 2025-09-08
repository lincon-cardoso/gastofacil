import Image from "next/image";

export function Main() {
  return (
    <main id="main" className="main-container">
      <div className="main-image-container">
        <Image
          src="/images/maintela.png"
          alt="Mesa de trabalho"
          width={1200}
          height={700}
          priority
        />
        <div className="main-overlay">
          <div className="main-hero" aria-label="Hero principal">
            <h1 className="main-title">
              Controle seus gastos e alcance suas metas.
            </h1>
            <h2 className="main-subtitle">
              Organize suas finanças de forma simples e eficiente.
            </h2>
            <button className="main-cta-button" aria-label="Começar grátis">
              Começar grátis
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
