import style from '@/components/footer/page.module.scss';
export default function Footer() {
  return (
    <footer className={style.footer}>
      <p className={style.footerText}>
        © {new Date().getFullYear()} GastoFácil. Todos os direitos reservados.
      </p>
    </footer>
  );
}
