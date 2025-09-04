export function Footer() {
  return (
    <footer className="gf-footer">
      <div className="gf-footer-columns">
        <div className="gf-footer-column">
          <h4>Produto</h4>
          <ul>
            <li>
              <a href="#">Início</a>
            </li>
            <li>
              <a href="#">Funcionalidades</a>
            </li>
            <li>
              <a href="#">Planilhas</a>
            </li>
            <li>
              <a href="#">Objetivos</a>
            </li>
          </ul>
        </div>
        <div className="gf-footer-column">
          <h4>Conteúdo</h4>
          <ul>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">Dicas financeiras</a>
            </li>
            <li>
              <a href="#">Guias</a>
            </li>
          </ul>
        </div>
        <div className="gf-footer-column">
          <h4>Suporte</h4>
          <ul>
            <li>
              <a href="#">Ajuda</a>
            </li>
            <li>
              <a href="#">Contato</a>
            </li>
            <li>
              <a href="#">Política de Privacidade</a>
            </li>
            <li>
              <a href="#">Termos de Uso</a>
            </li>
          </ul>
        </div>
        <div className="gf-footer-column">
          <h4>Redes</h4>
          <ul>
            <li>
              <a href="#">LinkedIn</a>
            </li>
            <li>
              <a href="#">GitHub</a>
            </li>
            <li>
              <a href="#">Instagram</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="gf-footer-disclaimers">
        <p>
          <strong>Projeto de portfólio:</strong> Este site é um protótipo
          desenvolvido por Lincon para fins de demonstração técnica (Next.js,
          TypeScript, Prisma).
        </p>
        <p>
          <strong>Inspiração de layout:</strong> Layout visual inspirado em
          template Nicepage. Imagens usadas apenas para estudo/demonstração, sem
          fins comerciais.
        </p>
        <p>
          <strong>Créditos técnicos:</strong> Integrações e dados exibidos podem
          ser simulados.
        </p>
      </div>
      <small>
        &copy; {new Date().getFullYear()} GastoFácil. Todos os direitos
        reservados.
      </small>
    </footer>
  );
}
