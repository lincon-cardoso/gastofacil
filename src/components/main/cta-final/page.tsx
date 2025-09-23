import styles from '@/components/main/cta-final/page.module.scss';
export default function CtaFinal() { 
  return (
    <section className={styles.heroSection} data-reveal>
      <div className={styles.backgroundImage} />
      <div className={styles.content}>
        <h3>Pronto para assumir o controle?</h3>
        <p>
          100% gratuito, seguro e pronto para usar. Sem cartão de crédito
          necessário.
        </p>
        <a href="#" className={styles.ctaButton}>
          Criar conta gratuita
        </a>
        <p className={styles.securityNote}>
          🔒 Seus dados são protegidos com segurança SSL e GDPR compliant.
        </p>
      </div>
    </section>
  );
}
